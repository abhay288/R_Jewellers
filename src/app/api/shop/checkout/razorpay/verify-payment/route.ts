import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Order from '@/backend/models/Order';
import crypto from 'crypto';
import { EmailService } from '@/backend/services/EmailService';
import User from '@/backend/models/User';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required payment verification fields' }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch order details from database
    const order = await Order.findOne({ orderId, user: session.user.id });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prevent duplicate processing and replay attacks
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ success: true, message: 'Payment already processed' });
    }

    // 2. Verify signature
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Mark local database order as failed payment
      order.paymentStatus = 'failed';
      await order.save();
      return NextResponse.json({ error: 'Payment verification failed (signature mismatch)' }, { status: 400 });
    }

    // 3. Mark database order as paid
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    
    order.status = 'Confirmed'; // Online payments automatically get Confirmed
    order.trackingTimeline.push({ status: 'Confirmed', date: new Date(), note: 'Payment received via Razorpay.' });
    await order.save();

    // 4. Send Confirmation & Alert Emails
    try {
      const userObj = await User.findById(session.user.id);
      const emailService = new EmailService();
      if (userObj) {
        await emailService.sendOrderConfirmationEmail(userObj.email, userObj.name, order);
      }
      await emailService.sendOwnerNewOrderAlertEmail(order);
    } catch (emailErr) {
      console.error('Failed to send order confirmation or owner alert emails on paid order:', emailErr);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Razorpay Verify Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
