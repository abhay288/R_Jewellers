import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Order from '@/backend/models/Order';
import Razorpay from 'razorpay';

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

    // 1. Fetch order details from database
    const order = await Order.findOne({ orderId, user: session.user.id });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Validate amount (minimum amount 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);
    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum amount required is 100 paise (₹1)' }, { status: 400 });
    }

    // 3. Initialize Razorpay Client
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 4. Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 5. Update local database order with Razorpay Order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });

  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
