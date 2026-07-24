import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Order from '@/backend/models/Order';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch order details from database (support matching by orderId or _id)
    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await Order.findOne({
      $or: [
        { orderId: orderId },
        ...(isObjectId ? [{ _id: orderId }] : [])
      ],
      user: session.user.id
    });

    if (!order) {
      console.error(`Razorpay order creation failed: Order ${orderId} not found for user ${session.user.id}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Validate amount (minimum amount 100 paise = ₹1)
    const amountInPaise = Math.round(order.totalAmount * 100);
    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum amount required is 100 paise (₹1)' }, { status: 400 });
    }

    // 3. Initialize Razorpay Client
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      console.error('Razorpay Error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in environment variables');
      return NextResponse.json({ error: 'Razorpay keys not configured on server' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 4. Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderId || String(order._id),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 5. Update local database order with Razorpay Order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId
    });

  } catch (error: any) {
    console.error('Razorpay Create Order Failure:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error creating payment order' }, { status: 500 });
  }
}
