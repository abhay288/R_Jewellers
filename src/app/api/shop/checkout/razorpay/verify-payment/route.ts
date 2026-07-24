import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import crypto from 'crypto';
import { SettingService } from '@/backend/services/SettingService';
import { OrderService } from '@/backend/services/OrderService';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      addressId,
      couponCode,
      items,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = await req.json();

    if (!addressId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required payment verification details' }, { status: 400 });
    }

    await dbConnect();

    // 1. Resolve Razorpay API key secret
    const settingService = new SettingService();
    const dbKeySecret = await settingService.getSettingByKey('razorpayKeySecret', '');
    const sanitizeKey = (val: any) => {
      if (!val) return '';
      return String(val).trim().replace(/^["']|["']$/g, '').trim();
    };
    const keySecret = sanitizeKey(dbKeySecret) || sanitizeKey(process.env.RAZORPAY_KEY_SECRET) || 'hXy0wKqwUDZDcWc3JCypSoet';

    // 2. Verify Razorpay Payment Signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error(`[Razorpay Signature Verification Failed] Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
      return NextResponse.json({ error: 'Invalid payment signature. Payment verification failed.' }, { status: 400 });
    }

    // 3. Confirm online order (Idempotency, stock deduction, MongoDB order creation, cart clear, invoice PDF, emails)
    const orderService = new OrderService();
    const confirmedOrder = await orderService.confirmOnlineOrder(
      session.user.id,
      addressId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      couponCode,
      items
    );

    return NextResponse.json({
      success: true,
      orderId: confirmedOrder.orderId
    });

  } catch (error: any) {
    console.error('Razorpay Verify Payment Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error verifying payment' }, { status: 500 });
  }
}
