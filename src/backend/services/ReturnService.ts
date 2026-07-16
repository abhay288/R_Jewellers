import mongoose from 'mongoose';
import Return from '../models/Return';
import ReturnTimeline from '../models/ReturnTimeline';
import Refund from '../models/Refund';
import DamagedInventory from '../models/DamagedInventory';
import Order from '../models/Order';
import Counter from '../models/Counter';
import Product from '../models/Product';
import { NotificationService } from './NotificationService';
import User from '../models/User';
import { EmailService } from './EmailService';

export class ReturnService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Generates a sequential Return ID (e.g., RJRET-2026-000001)
   */
  private async generateReturnId(session?: mongoose.mongo.ClientSession): Promise<string> {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      'returnId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );
    const seqStr = String(counter.seq).padStart(6, '0');
    return `RJRET-${year}-${seqStr}`;
  }

  /**
   * Validates UPI Format
   */
  private isValidUPI(upiId: string): boolean {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  }

  /**
   * Customer: Creates a return request
   */
  async createReturnRequest(
    userId: string, 
    orderId: string, 
    products: any[], 
    reason: string, 
    notes: string, 
    images: string[], 
    upiId: string
  ) {
    if (!this.isValidUPI(upiId)) {
      throw new Error("Invalid UPI ID format.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch Order
      const order = await Order.findOne({ orderId, user: userId }).session(session);
      if (!order) throw new Error("Order not found.");

      // 2. Validate Status and Window
      if (order.status !== 'Delivered') {
        throw new Error("Only delivered orders can be returned.");
      }
      
      if (!order.returnEligibilityDate || new Date() > order.returnEligibilityDate) {
        throw new Error("Return window (48 hours) has expired for this order.");
      }

      // 3. Check for existing returns to prevent duplicates
      const existingReturn = await Return.findOne({ order: order._id, status: { $ne: 'Rejected' } }).session(session);
      if (existingReturn) {
        throw new Error("A return request already exists for this order.");
      }

      // 4. Calculate Refund Amount and validate products
      let totalRefundAmount = 0;
      const validProducts = [];

      for (const item of products) {
        const orderProduct = order.products.find(p => p.product.toString() === item.productId.toString());
        if (!orderProduct) {
          throw new Error(`Product ${item.productId} is not part of this order.`);
        }
        if (item.quantity > orderProduct.quantity) {
          throw new Error(`Cannot return more quantity than ordered for ${orderProduct.name}.`);
        }
        
        // Assume proportional refund based on finalPrice
        const refundAmount = orderProduct.finalPrice * item.quantity;
        totalRefundAmount += refundAmount;
        validProducts.push({
          product: orderProduct.product,
          quantity: item.quantity,
          refundAmount
        });
      }

      if (validProducts.length === 0) {
        throw new Error("No valid products provided for return.");
      }

      // 5. Generate Return ID
      const returnIdStr = await this.generateReturnId(session);

      // 6. Create Return
      const newReturn = await Return.create([{
        returnId: returnIdStr,
        order: order._id,
        user: userId,
        products: validProducts,
        reason,
        notes,
        images,
        upiDetails: upiId,
        status: 'Return Requested',
        totalRefundAmount
      }], { session });

      // 7. Create Timeline
      await ReturnTimeline.create([{
        return: newReturn[0]._id,
        status: 'Return Requested',
        updatedBy: userId,
        notes: `Return requested by customer. Reason: ${reason}`
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // Notifications
      this.notificationService.createNotification(
        userId,
        'Return Request Submitted',
        `Your return request ${returnIdStr} has been submitted and is under review.`,
        'order',
        `/profile/returns/${returnIdStr}`
      );

      try {
        this.notificationService.sendAdminPushNotification(
          'New Return Request',
          `A new return request ${returnIdStr} has been submitted by customer.`,
          `/admin/returns/${returnIdStr}`
        );

        // Send owner new return alert email
        const emailService = new EmailService();
        await emailService.sendOwnerNewReturnAlertEmail(newReturn[0]);
      } catch (adminPushErr) {
        console.error('Failed to notify admins of new return request via push/email:', adminPushErr);
      }

      return newReturn[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Admin: Update Return Status
   */
  async updateReturnStatus(returnId: string, status: string, adminId: string, notes?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const returnReq = await Return.findOne({ returnId }).populate('order').session(session);
      if (!returnReq) throw new Error("Return request not found.");

      const validTransitions: any = {
        'Return Requested': ['Under Review', 'Rejected'],
        'Under Review': ['Approved', 'Rejected'],
        'Approved': ['Pickup Scheduled'],
        'Pickup Scheduled': ['Picked Up'],
        'Picked Up': ['Received'],
        'Received': ['Quality Check'],
        'Quality Check': ['Refund Approved', 'Rejected'],
        'Refund Approved': ['Refund Completed'], // Usually automated via refund process, but kept for manual override if needed
        'Refund Completed': [],
        'Rejected': []
      };

      if (!validTransitions[returnReq.status]?.includes(status)) {
        throw new Error(`Invalid status transition from ${returnReq.status} to ${status}`);
      }

      returnReq.status = status as any;
      await returnReq.save({ session });

      await ReturnTimeline.create([{
        return: returnReq._id,
        status,
        updatedBy: adminId,
        notes: notes || `Status updated to ${status} by Admin`
      }], { session });

      // If approved, update order status to Returned (maybe wait until Refund Completed? We'll leave Order status as is or 'Returned' based on business logic. Usually 'Returned' implies completion.)
      if (status === 'Refund Completed') {
        const order = await Order.findById(returnReq.order).session(session);
        if (order) {
          order.status = 'Returned';
          order.trackingTimeline.push({ status: 'Returned', date: new Date(), note: 'Return completed and refunded.' });
          await order.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      // Notifications
      this.notificationService.createNotification(
        returnReq.user.toString(),
        `Return ${status}`,
        `Your return request ${returnId} has been updated to ${status}.`,
        'order',
        `/profile/returns/${returnId}`
      );

      // Email notifications
      try {
        const userObj = await User.findById(returnReq.user);
        if (userObj) {
          const emailService = new EmailService();
          if (status === 'Approved') {
            await emailService.sendReturnApprovedEmail(userObj.email, userObj.name, returnId);
          } else if (status === 'Refund Completed') {
            await emailService.sendRefundCompletedEmail(
              userObj.email,
              userObj.name,
              returnId,
              returnReq.totalRefundAmount
            );
          }
        }
      } catch (emailErr) {
        console.error('Failed to trigger return status update emails:', emailErr);
      }

      return returnReq;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Admin: Process Quality Check
   */
  async processQualityCheck(returnId: string, adminId: string, itemsQC: { productId: string, condition: 'Good' | 'Damaged', reason?: string }[]) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const returnReq = await Return.findOne({ returnId }).session(session);
      if (!returnReq || returnReq.status !== 'Received') {
        throw new Error("Return must be in 'Received' status to perform Quality Check.");
      }

      for (const qc of itemsQC) {
        const item = returnReq.products.find(p => p.product.toString() === qc.productId);
        if (!item) throw new Error(`Product ${qc.productId} not found in this return.`);

        if (qc.condition === 'Good') {
          // Increase stock
          await Product.findByIdAndUpdate(qc.productId, { $inc: { stock: item.quantity } }, { session });
        } else {
          // Add to damaged inventory
          await DamagedInventory.create([{
            product: qc.productId,
            quantity: item.quantity,
            return: returnReq._id,
            reason: qc.reason || 'Failed QC during return process'
          }], { session });
        }
      }

      returnReq.status = 'Quality Check' as any;
      await returnReq.save({ session });

      await ReturnTimeline.create([{
        return: returnReq._id,
        status: 'Quality Check',
        updatedBy: adminId,
        notes: 'Quality Check completed.'
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // Notify customer
      try {
        this.notificationService.createNotification(
          returnReq.user.toString(),
          'Return Quality Check Completed',
          `Your return request ${returnId} has successfully completed quality inspection.`,
          'order',
          `/profile/returns/${returnId}`
        );
      } catch (custPushErr) {
        console.error('Failed to notify customer of quality check completion via push:', custPushErr);
      }

      return returnReq;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Admin: Process Refund (Manual via UPI)
   */
  async processRefund(returnId: string, adminId: string, transactionReference: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const returnReq = await Return.findOne({ returnId }).session(session);
      if (!returnReq) throw new Error("Return request not found.");
      if (!['Quality Check', 'Refund Approved'].includes(returnReq.status)) {
        throw new Error("Invalid status for processing refund.");
      }

      // Check if refund already exists
      const existingRefund = await Refund.findOne({ return: returnReq._id }).session(session);
      if (existingRefund) {
        throw new Error("Refund already processed for this return.");
      }

      // Create Refund Record
      await Refund.create([{
        return: returnReq._id,
        order: returnReq.order,
        user: returnReq.user,
        amount: returnReq.totalRefundAmount,
        upiId: returnReq.upiDetails,
        transactionReference,
        processedBy: adminId,
        processedAt: new Date(),
        status: 'Completed'
      }], { session });

      // Update Return Status
      returnReq.status = 'Refund Completed' as any;
      await returnReq.save({ session });

      // Update Order Status
      const order = await Order.findById(returnReq.order).session(session);
      if (order) {
        order.status = 'Returned';
        order.trackingTimeline.push({ status: 'Returned', date: new Date(), note: `Refunded via UPI: ${transactionReference}` });
        await order.save({ session });
      }

      await ReturnTimeline.create([{
        return: returnReq._id,
        status: 'Refund Completed',
        updatedBy: adminId,
        notes: `Refund processed manually via UPI. Ref: ${transactionReference}`
      }], { session });

      await session.commitTransaction();
      session.endSession();

      this.notificationService.createNotification(
        returnReq.user.toString(),
        'Refund Completed',
        `Your refund of ₹${returnReq.totalRefundAmount} for return ${returnId} has been successfully processed to your UPI ID.`,
        'order',
        `/profile/returns/${returnId}`
      );

      // Email notification
      try {
        const userObj = await User.findById(returnReq.user);
        if (userObj) {
          const emailService = new EmailService();
          await emailService.sendRefundCompletedEmail(
            userObj.email,
            userObj.name,
            returnId,
            returnReq.totalRefundAmount
          );
        }
      } catch (emailErr) {
        console.error('Failed to trigger refund completed email:', emailErr);
      }

      return returnReq;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Fetch returns with pagination (Admin or Customer)
   */
  async getReturns(query: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [returns, total] = await Promise.all([
      Return.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('order', 'orderId')
        .populate('user', 'name email')
        .populate('products.product', 'name images sku'),
      Return.countDocuments(query)
    ]);

    return { returns, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Get single return by ID
   */
  async getReturnById(returnId: string, userId?: string) {
    const query: any = { returnId };
    if (userId) query.user = userId;
    
    return Return.findOne(query)
      .populate('order', 'orderId totalAmount')
      .populate('user', 'name email phone')
      .populate('products.product', 'name images sku price finalPrice');
  }
}
