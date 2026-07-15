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
  async calculateTotals(userId: string, couponCode?: string) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    let subtotal = 0;
    const products = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product not found`);
      
      const price = product.finalPrice || product.price;
      subtotal += price * item.quantity;
      
      products.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: product.price - price,
        finalPrice: price
      });
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.minPurchaseAmount || subtotal >= coupon.minPurchaseAmount) {
            if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
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
          }
        }
      }
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
   * Places an order using MongoDB transactions
   */
  async placeOrder(userId: string, addressId: string, couponCode?: string, paymentMethod: string = 'COD') {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Validate Address
      const address = await Address.findOne({ _id: addressId, user: userId }).session(session);
      if (!address) throw new Error("Invalid address");

      // 2. Calculate Totals and Validate Products/Coupon
      const totals = await this.calculateTotals(userId, couponCode);

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
        status: 'Order Placed',
        paymentMethod,
        paymentStatus: 'pending', // COD
        trackingTimeline: [{ status: 'Order Placed', note: 'Order has been placed successfully.' }]
      }], { session });

      // 7. Create standalone OrderTimeline entry
      await OrderTimeline.create([{
        order: newOrder[0]._id,
        status: 'Order Placed',
        updatedBy: userId, // Customer placed the order
        notes: 'Order placed successfully by customer.'
      }], { session });

      // 8. Clear Cart
      await Cart.findByIdAndUpdate(totals.cartId, { $set: { items: [] } }, { session });

      // Commit Transaction
      await session.commitTransaction();
      session.endSession();

      // Fire notification non-blocking
      this.notificationService.sendOrderStatusNotification(userId, orderId, 'Order Placed');

      // Send Order Confirmation Email
      try {
        const userObj = await User.findById(userId);
        if (userObj) {
          const emailService = new EmailService();
          await emailService.sendOrderConfirmationEmail(userObj.email, userObj.name, newOrder[0]);
        }
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr);
      }

      // Check for low stock on purchased items
      try {
        for (const item of totals.products) {
          const prod = await Product.findById(item.product);
          if (prod && prod.stock <= prod.minimumStock) {
            await this.notificationService.sendAdminPushNotification(
              'Low Stock Alert',
              `Product "${prod.name}" has run low on stock (${prod.stock} items remaining).`,
              '/admin/inventory'
            );
          }
        }
      } catch (stockErr) {
        console.error('Failed to run post-order low stock checks:', stockErr);
      }

      return newOrder[0];

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
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

      // Send status update and invoice emails
      try {
        const userObj = await User.findById(order.user);
        if (userObj) {
          const emailService = new EmailService();
          await emailService.sendOrderStatusChangedEmail(userObj.email, userObj.name, order.orderId, status);
          
          if (status === 'Confirmed') {
            await emailService.sendOrderConfirmationEmail(userObj.email, userObj.name, order);
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
      const order = await Order.findOne({ orderId, user: customerId }).session(session);
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
        .populate('products.product', 'images name sku slug'),
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
      // Search by Order ID only for now, since customer name/email is inside the user doc
      // A more advanced aggregation is needed for user name search, but we stick to orderId here
      query.orderId = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email phone')
        .populate('shippingAddress'),
      Order.countDocuments(query)
    ]);

    return { orders, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Get Single Order
   */
  async getOrderById(orderId: string, userId?: string) {
    const query: any = { orderId };
    if (userId) query.user = userId;
    
    return Order.findOne(query)
      .populate('user', 'name email phone')
      .populate('shippingAddress')
      .populate('products.product', 'images name sku slug price');
  }
}
