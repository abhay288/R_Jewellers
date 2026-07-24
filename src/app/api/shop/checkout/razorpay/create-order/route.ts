import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Order from '@/backend/models/Order';
import { SettingService } from '@/backend/services/SettingService';
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

    // 1. Fetch order details from database
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
      return NextResponse.json({ error: 'Minimum amount required is ₹1' }, { status: 400 });
    }

    // 3. Resolve Razorpay API keys (from MongoDB Admin Settings DB or Environment)
    const settingService = new SettingService();
    const dbKeyId = await settingService.getSettingByKey('razorpayKeyId', '');
    const dbKeySecret = await settingService.getSettingByKey('razorpayKeySecret', '');

    const keyId = (
      dbKeyId || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TEEygPJ4TOEaHW'
    ).toString().trim();

    const keySecret = (
      dbKeySecret || process.env.RAZORPAY_KEY_SECRET || 'hXy0wKqwUDZDcWc3JCypSoet'
    ).toString().trim();

    // 4. Attempt Razorpay Order Creation via SDK
    let razorpayOrderId: string | undefined = undefined;

    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const rawReceipt = (order.orderId || String(order._id)).replace(/[^a-zA-Z0-9_-]/g, '');
        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: rawReceipt.substring(0, 40),
          notes: {
            orderId: order.orderId,
            userId: String(session.user.id),
          }
        };

        const razorpayOrder = await razorpay.orders.create(options);
        if (razorpayOrder && razorpayOrder.id) {
          razorpayOrderId = razorpayOrder.id;
          order.razorpayOrderId = razorpayOrder.id;
          await order.save();
        }
      } catch (rpErr: any) {
        console.warn('Razorpay SDK orders.create warning (falling back to direct client checkout):', rpErr?.message || rpErr);
      }
    }

    // 5. Return success with keyId, amount, currency, and razorpayOrderId (if created)
    return NextResponse.json({
      success: true,
      order_id: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: keyId
    });

  } catch (error: any) {
    console.error('Razorpay Create Order Failure:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error creating payment order' }, { status: 500 });
  }
}
