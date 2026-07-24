import mongoose from 'mongoose';
import { OrderRepository } from '../repositories/OrderRepository';
import Order from '../models/Order';
import Counter from '../models/Counter';
import Product from '../models/Product';
import Cart from '../models/Cart';
import Coupon from '../models/Coupon';
import Address from '../models/Address';
import OrderTimeline from '../models/OrderTimeline';
import { NotificationService } from './NotificationService';
import User from '../models/User';
import { EmailService } from './EmailService';
import { generateServerInvoicePDF } from '../lib/ServerInvoiceGenerator';

export class OrderService {
  private repository: OrderRepository;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new OrderRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Generates a sequential Order ID (e.g., RJORD-2026-000001)
   */
  private async generateOrderId(session?: mongoose.mongo.ClientSession): Promise<string> {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      'orderId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );
    
    // Format to 6 digits, e.g., 000001
    const seqStr = String(counter.seq).padStart(6, '0');
    return `RJORD-${year}-${seqStr}`;
  }

  /**
   * Calculate totals (re-validated on server)
   */
  async calculateTotals(userId: string, couponCode?: string, clientItems?: Array<{ id: string; quantity: number }>, session?: mongoose.ClientSession) {
    let cartQuery = Cart.findOne({ user: userId }).populate('items.product');
    if (session) cartQuery = cartQuery.session(session);
    let cart = await cartQuery;

    // If DB cart is empty or missing, but client provided items, sync client items into DB Cart
    if ((!cart || !cart.items || cart.items.length === 0) && clientItems && clientItems.length > 0) {
      const formattedItems = clientItems.map(item => ({
        product: item.id,
        quantity: item.quantity
      }));
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: formattedItems } },
        { upsert: true, new: true, session }
      ).populate('items.product');
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    let subtotal = 0;
    const products = [];

    for (const item of cart.items) {
      let prodQuery = Product.findById(item.product);
      if (session) prodQuery = prodQuery.session(session);
      const product = await prodQuery;
      if (!product) throw new Error(`Product not found`);
      
      const price = product.finalPrice || product.price;
      subtotal += price * item.quantity;
      
      products.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: product.price - price,
        finalPrice: price,
        image: product.images?.[0] || ''
      });
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      let couponQuery = Coupon.findOne({ code: cleanCode });
      if (session) couponQuery = couponQuery.session(session);
      const coupon = await couponQuery;
      
      if (!coupon || !coupon.isActive) {
        throw new Error('Invalid or inactive coupon code.');
      }

      const now = new Date();
      if (now < coupon.validFrom) {
        throw new Error('This coupon is not valid yet.');
      }
      if (now > coupon.validUntil) {
        throw new Error('This coupon has expired.');
      }
      if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
        throw new Error(`Minimum purchase amount of ₹${coupon.minPurchaseAmount} required for this coupon.`);
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error('This coupon usage limit has been reached.');
      }

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.discountValue;
      }
      appliedCoupon = coupon;
    }

    const deliveryCharges = (subtotal - discount) >= 499 ? 0 : 50;
    const totalAmount = subtotal - discount + deliveryCharges;

    return {
      subtotal,
      discount,
      deliveryCharges,
      totalAmount,
      appliedCoupon,
      products,
      cartId: cart._id
    };
  }

  /**
   * Places an order using MongoDB transactions with write conflict retries and non-transaction fallback
   */
  async placeOrder(userId: string, addressId: string, couponCode?: string, paymentMethod: string = 'COD', clientItems?: Array<{ id: string; quantity: number }>, retries = 3): Promise<any> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // 1. Validate Address
      const address = await Address.findOne({ _id: addressId, user: userId }).session(session);
      if (!address) throw new Error("Invalid address");

      // 2. Calculate Totals and Validate Products/Coupon
      const totals = await this.calculateTotals(userId, couponCode, clientItems, session);

      // 3. Validate Inventory and Deduct Stock
      for (const item of totals.products) {
        const product = await Product.findOne({ _id: item.product }).session(session);
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.name}`);
        }
        
        // Decrement stock atomically
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );

        if (!updatedProduct) {
          throw new Error(`Failed to secure stock for product: ${item.name}`);
        }
      }

      // 4. Update Coupon Usage
      if (totals.appliedCoupon) {
        const updatedCoupon = await Coupon.findOneAndUpdate(
          { _id: totals.appliedCoupon._id, $expr: { $lt: ["$usedCount", { $ifNull: ["$usageLimit", 999999999] }] } },
          { $inc: { usedCount: 1 } },
          { new: true, session }
        );

        if (!updatedCoupon) {
          throw new Error("Coupon limit reached or expired during checkout.");
        }
      }

      // 5. Generate Order ID
      const orderId = await this.generateOrderId(session);

      const shippingAddressSnapshot = {
        fullName: address.fullName,
        phone: address.phone,
        alternatePhone: (address as any).alternatePhone || (address as any).alternateMobile,
        email: address.email,
        houseNo: address.houseNo,
        street: address.street,
        landmark: address.landmark,
        area: address.area,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country || 'India'
      };

      // 6. Create Order
      const newOrder = await Order.create([{
        orderId,
        user: userId,
        products: totals.products,
        totalAmount: totals.totalAmount,
        discount: totals.discount,
        deliveryCharges: totals.deliveryCharges,
        coupon: totals.appliedCoupon ? totals.appliedCoupon._id : undefined,
        shippingAddress: addressId,
        shippingAddressSnapshot,
        status: 'Order Placed',
        paymentMethod,
        paymentStatus: 'pending',
        trackingTimeline: [{ status: 'Order Placed', note: 'Order has been placed successfully.' }]
      }], { session });

      // 7. Create standalone OrderTimeline entry
      await OrderTimeline.create([{
        order: newOrder[0]._id,
        status: 'Order Placed',
        updatedBy: userId,
        notes: 'Order placed successfully by customer.'
      }], { session });

      // 8. Clear Cart
      await Cart.findByIdAndUpdate(totals.cartId, { $set: { items: [] } }, { session });

      // Commit Transaction
      await session.commitTransaction();
      session.endSession();

      // Post-order async tasks
      this.notificationService.sendOrderStatusNotification(userId, orderId, 'Order Placed');

      try {
        const emailService = new EmailService();
        await emailService.sendOwnerNewOrderAlertEmail(newOrder[0]);
      } catch (emailErr) {
        console.error('Failed to send owner alert email:', emailErr);
      }

      return newOrder[0];

    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();

      const errMsg = error?.message || '';
      const isWriteConflict = errMsg.includes('Write conflict') || error?.code === 112 || error?.hasErrorLabel?.('TransientTransactionError');
      
      if (isWriteConflict && retries > 0) {
        console.warn(`Write conflict encountered during placeOrder. Retrying... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, 150 * (4 - retries)));
        return this.placeOrder(userId, addressId, couponCode, paymentMethod, clientItems, retries - 1);
      }

      // If transactions fail due to MongoDB Atlas environment (e.g. write conflict or transaction yielding restrictions), fallback to atomic execution
      if (isWriteConflict || errMsg.includes('Transaction') || errMsg.includes('replica set') || errMsg.includes('multi-document transaction')) {
        console.warn("Executing atomic non-transaction fallback for placeOrder.");
        return this.placeOrderWithoutTransaction(userId, addressId, couponCode, paymentMethod, clientItems);
      }

      throw error;
    }
  }

  /**
   * Non-transaction atomic fallback for placeOrder when multi-document transactions encounter write conflicts
   */
  async placeOrderWithoutTransaction(userId: string, addressId: string, couponCode?: string, paymentMethod: string = 'COD', clientItems?: Array<{ id: string; quantity: number }>) {
    // 1. Validate Address
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) throw new Error("Invalid address");

    // 2. Calculate Totals and Validate Products/Coupon
    const totals = await this.calculateTotals(userId, couponCode, clientItems);

    // 3. Validate Inventory and Deduct Stock atomically
    for (const item of totals.products) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Insufficient stock for product: ${item.name}`);
      }
    }

    // 4. Update Coupon Usage atomically
    if (totals.appliedCoupon) {
      await Coupon.findOneAndUpdate(
        { _id: totals.appliedCoupon._id, $expr: { $lt: ["$usedCount", { $ifNull: ["$usageLimit", 999999999] }] } },
        { $inc: { usedCount: 1 } }
      );
    }

    // 5. Generate Order ID
    const orderId = await this.generateOrderId();

    const shippingAddressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      alternatePhone: (address as any).alternatePhone || (address as any).alternateMobile,
      email: address.email,
      houseNo: address.houseNo,
      street: address.street,
      landmark: address.landmark,
      area: address.area,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India'
    };

    // 6. Create Order
    const newOrder = await Order.create({
      orderId,
      user: userId,
      products: totals.products,
      totalAmount: totals.totalAmount,
      discount: totals.discount,
      deliveryCharges: totals.deliveryCharges,
      coupon: totals.appliedCoupon ? totals.appliedCoupon._id : undefined,
      shippingAddress: addressId,
      shippingAddressSnapshot,
      status: 'Order Placed',
      paymentMethod,
      paymentStatus: 'pending',
      trackingTimeline: [{ status: 'Order Placed', note: 'Order has been placed successfully.' }]
    });

    // 7. Create standalone OrderTimeline entry
    await OrderTimeline.create({
      order: newOrder._id,
      status: 'Order Placed',
      updatedBy: userId,
      notes: 'Order placed successfully by customer.'
    });

    // 8. Clear Cart
    await Cart.findByIdAndUpdate(totals.cartId, { $set: { items: [] } });

    // Post-order async tasks
    this.notificationService.sendOrderStatusNotification(userId, orderId, 'Order Placed');

    try {
      const emailService = new EmailService();
      await emailService.sendOwnerNewOrderAlertEmail(newOrder);
    } catch (emailErr) {
      console.error('Failed to send owner alert email:', emailErr);
    }

    return newOrder;
  }

  /**
   * Admin: Update Order Status
   */
  async updateOrderStatus(orderId: string, status: string, notes: string, updatedBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findOne({ orderId }).session(session);
      if (!order) throw new Error("Order not found");

      // Allowed transitions logic
      const validTransitions: any = {
        'Order Placed': ['Confirmed', 'Cancelled'],
        'Confirmed': ['Packed', 'Cancelled'],
        'Packed': ['Shipped'], // Cannot cancel after Packed
        'Shipped': ['Out For Delivery'],
        'Out For Delivery': ['Delivered'],
        'Delivered': ['Returned'],
        'Cancelled': [],
        'Returned': []
      };

      if (!validTransitions[order.status]?.includes(status)) {
        throw new Error(`Invalid status transition from ${order.status} to ${status}`);
      }

      // Update Order document
      order.status = status as any;
      if (status === 'Delivered') {
        order.returnEligibilityDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
      }
      order.trackingTimeline.push({ status, date: new Date(), note: notes });
      await order.save({ session });

      // Insert standalone timeline record
      await OrderTimeline.create([{
        order: order._id,
        status: status as any,
        updatedBy, // Admin ID
        notes
      }], { session });

      // Commit Transaction
      await session.commitTransaction();
      session.endSession();

      // Fire notification
      this.notificationService.sendOrderStatusNotification(order.user.toString(), order.orderId, status);

      // Send status update and invoice emails (Bill sent ONLY when order is Confirmed)
      try {
        const userObj = await User.findById(order.user);
        if (userObj) {
          const emailService = new EmailService();
          await emailService.sendOrderStatusChangedEmail(userObj.email, userObj.name, order.orderId, status);
          
          if (status === 'Confirmed') {
            const populatedOrder = await Order.findById(order._id)
              .populate('shippingAddress')
              .populate('products.product')
              .lean();

            const pdfBuffer = generateServerInvoicePDF(populatedOrder ?? order);
            await emailService.sendInvoiceEmail(userObj.email, userObj.name, populatedOrder ?? order, pdfBuffer);
          }
        }
      } catch (emailErr) {
        console.error('Failed to trigger order status update emails:', emailErr);
      }

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Customer: Cancel Order
   */
  async cancelOrder(orderId: string, reason: string, customerId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
      const orderQuery: any = {
        $or: [
          { orderId: orderId, user: customerId },
          ...(isObjectId ? [{ _id: orderId, user: customerId }] : [])
        ]
      };
      const order = await Order.findOne(orderQuery).session(session);
      if (!order) throw new Error("Order not found");

      if (['Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
        throw new Error("Order cannot be cancelled at this stage");
      }

      const status = 'Cancelled';
      order.status = status;
      order.trackingTimeline.push({ status, date: new Date(), note: `Cancelled by Customer: ${reason}` });
      await order.save({ session });

      // Revert Inventory Stock
      for (const item of order.products) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      // Insert timeline record
      await OrderTimeline.create([{
        order: order._id,
        status: status as any,
        updatedBy: customerId,
        notes: `Cancelled by Customer: ${reason}`
      }], { session });

      // Commit
      await session.commitTransaction();
      session.endSession();

      // Notification
      this.notificationService.sendOrderStatusNotification(order.user.toString(), order.orderId, status);

      // Notify Admin
      try {
        this.notificationService.sendAdminPushNotification(
          'Order Cancelled by Customer',
          `Order ${order.orderId} has been cancelled by the customer.`,
          `/admin/orders/${order.orderId}`
        );
      } catch (adminPushErr) {
        console.error('Failed to notify admins of order cancellation via push:', adminPushErr);
      }

      // Send cancellation email
      try {
        const userObj = await User.findById(order.user);
        if (userObj) {
          const emailService = new EmailService();
          await emailService.sendOrderStatusChangedEmail(userObj.email, userObj.name, order.orderId, 'Cancelled');
        }
      } catch (emailErr) {
        console.error('Failed to trigger order cancellation email:', emailErr);
      }

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get Orders for user with pagination
   */
  async getUserOrders(userId: string, page: number = 1, limit: number = 10, statusFilter?: string) {
    const query: any = { user: userId };
    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }

    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('shippingAddress')
        .populate('products.product', 'images name sku slug price'),
      Order.countDocuments(query)
    ]);

    return { orders, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Admin: Get all orders with search/filter
   */
  async getAdminOrders(page: number = 1, limit: number = 10, search?: string, statusFilter?: string) {
    const query: any = {};
    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }

    if (search) {
      const pipeline: any[] = [];

      if (statusFilter && statusFilter !== 'All') {
        pipeline.push({ $match: { status: statusFilter } });
      }

      // Join with users collection
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      });

      pipeline.push({
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      });

      // Search filters
      pipeline.push({
        $match: {
          $or: [
            { orderId: { $regex: search, $options: 'i' } },
            { awbNumber: { $regex: search, $options: 'i' } },
            { trackingNumber: { $regex: search, $options: 'i' } },
            { 'userDetails.name': { $regex: search, $options: 'i' } }
          ]
        }
      });

      // Count total
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await Order.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      // Sort & Paginate
      pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      // Join with shippingAddress
      pipeline.push({
        $lookup: {
          from: 'addresses',
          localField: 'shippingAddress',
          foreignField: '_id',
          as: 'shippingAddressDetails'
        }
      });

      pipeline.push({
        $unwind: {
          path: '$shippingAddressDetails',
          preserveNullAndEmptyArrays: true
        }
      });

      const results = await Order.aggregate(pipeline);

      const formattedOrders = results.map(o => ({
        ...o,
        user: o.userDetails ? {
          _id: o.userDetails._id,
          name: o.userDetails.name,
          email: o.userDetails.email,
          phone: o.userDetails.phone
        } : null,
        shippingAddress: o.shippingAddressDetails || null
      }));

      return { orders: formattedOrders, total, pages: Math.ceil(total / limit) };
    }

    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email phone')
        .populate('shippingAddress')
        .populate('products.product', 'images name sku slug price'),
      Order.countDocuments(query)
    ]);

    return { orders, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Get Single Order
   */
  async getOrderById(orderId: string, userId?: string) {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const query: any = {
      $or: [
        { orderId: orderId },
        ...(isObjectId ? [{ _id: orderId }] : [])
      ]
    };
    if (userId) query.user = userId;
    
    return Order.findOne(query)
      .populate('user', 'name email phone')
      .populate('shippingAddress')
      .populate('products.product', 'images name sku slug price');
  }
}
