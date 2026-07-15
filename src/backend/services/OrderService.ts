import mongoose from 'mongoose';
import { OrderRepository } from '../repositories/OrderRepository';
import Order from '../models/Order';
import Counter from '../models/Counter';
import Product from '../models/Product';
import Cart from '../models/Cart';
import Coupon from '../models/Coupon';
import Address from '../models/Address';

export class OrderService {
  private repository: OrderRepository;

  constructor() {
    this.repository = new OrderRepository();
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

      // 7. Clear Cart
      await Cart.findByIdAndUpdate(totals.cartId, { $set: { items: [] } }, { session });

      // Commit Transaction
      await session.commitTransaction();
      session.endSession();

      return newOrder[0];

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get Orders for user
   */
  async getUserOrders(userId: string) {
    return Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('shippingAddress')
      .populate('products.product', 'images name sku slug');
  }

  /**
   * Get Single Order
   */
  async getOrderById(orderId: string, userId?: string) {
    const query: any = { orderId };
    if (userId) query.user = userId;
    
    return Order.findOne(query)
      .populate('shippingAddress')
      .populate('products.product', 'images name sku slug');
  }
}

