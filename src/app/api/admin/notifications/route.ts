import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';
import ContactMessage from '@/backend/models/ContactMessage';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    await connectDB();

    const Order = mongoose.models.Order || require('@/backend/models/Order').default;
    const Return = mongoose.models.Return || require('@/backend/models/Return').default;

    const notifications: any[] = [];

    // 1. Low Stock Alerts
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(5);
    lowStockProducts.forEach((product: any) => {
      notifications.push({
        id: `stock-${product._id.toString()}`,
        title: 'Low Stock Alert',
        message: `${product.name} has only ${product.stock} items remaining.`,
        time: 'Restock soon',
        type: 'stock',
        isRead: false,
        createdAt: product.updatedAt || new Date()
      });
    });

    // 2. Unread Contact Messages
    const unreadMessages = await ContactMessage.find({ isRead: false }).limit(5);
    unreadMessages.forEach((msg: any) => {
      notifications.push({
        id: `msg-${msg._id.toString()}`,
        title: 'New Customer Inquiry',
        message: `Inquiry from ${msg.firstName} ${msg.lastName}: "${msg.subject}"`,
        time: 'Action required',
        type: 'message',
        isRead: false,
        createdAt: msg.createdAt || new Date()
      });
    });

    // 3. Pending Returns
    const pendingReturns = await Return.find({ status: { $in: ['Return Requested', 'Under Review', 'Quality Check'] } }).limit(5);
    pendingReturns.forEach((ret: any) => {
      notifications.push({
        id: `return-${ret._id.toString()}`,
        title: 'Return Requested',
        message: `Refund of ₹${ret.totalRefundAmount} requested for Order #${ret.orderId}`,
        time: 'Review return',
        type: 'order',
        isRead: false,
        createdAt: ret.createdAt || new Date()
      });
    });

    // 4. Recent Orders (last 24 hours)
    const recentOrders = await Order.find({ 
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    }).limit(5);
    recentOrders.forEach((order: any) => {
      notifications.push({
        id: `order-${order._id.toString()}`,
        title: 'New Order Received',
        message: `Order #${order.orderId} for ₹${order.totalAmount} has been placed.`,
        time: 'New order',
        type: 'order',
        isRead: false,
        createdAt: order.createdAt || new Date()
      });
    });

    // Sort notifications by date newest first
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error: any) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
