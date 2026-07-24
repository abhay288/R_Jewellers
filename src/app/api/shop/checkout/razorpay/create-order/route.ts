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

    // 3. Resolve Razorpay API keys (from MongoDB Admin Settings DB or Environment)
    const settingService = new SettingService();
    const keyId = (
      await settingService.getSettingByKey('razorpayKeyId', process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TEEygPJ4TOEaHW')
    ).toString().trim();
    const keySecret = (
      await settingService.getSettingByKey('razorpayKeySecret', process.env.RAZORPAY_KEY_SECRET || 'hXy0wKqwUDZDcWc3JCypSoet')
    ).toString().trim();

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay Key ID or Secret missing. Please update in Admin Settings.' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 4. Create Razorpay order (receipt string max 40 chars)
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

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rpErr: any) {
      console.error('Razorpay API SDK Order Creation Error:', rpErr);
      const rpErrMsg = rpErr?.error?.description || rpErr?.description || rpErr?.message || 'Razorpay authentication or API error';
      return NextResponse.json({ error: `Razorpay Error: ${rpErrMsg}. Please check Razorpay Key ID & Secret in Admin Settings.` }, { status: 400 });
    }

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
    return NextResponse.json({ error: error?.message || 'Internal Server Error creating payment order' }, { status: 500 });
  }
}
