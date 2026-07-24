import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Order from '@/backend/models/Order';
import crypto from 'crypto';
import { EmailService } from '@/backend/services/EmailService';
import { SettingService } from '@/backend/services/SettingService';
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

    // 2. Verify signature using DB settings or ENV fallback
    const settingService = new SettingService();
    const keySecret = (
      await settingService.getSettingByKey('razorpayKeySecret', process.env.RAZORPAY_KEY_SECRET || 'hXy0wKqwUDZDcWc3JCypSoet')
    ).toString().trim();

    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay Key Secret not configured' }, { status: 500 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
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

    // 4. Send Invoice PDF + Alert Emails
    try {
      const userObj = await User.findById(session.user.id);
      const emailService = new EmailService();
      if (userObj) {
        // Populate shipping address for proper invoice rendering
        const populatedOrder = await Order.findById(order._id)
          .populate('shippingAddress')
          .lean();

        const { generateServerInvoicePDF } = await import('@/backend/lib/ServerInvoiceGenerator');
        const pdfBuffer = generateServerInvoicePDF(populatedOrder ?? order);
        await emailService.sendInvoiceEmail(userObj.email, userObj.name, populatedOrder ?? order, pdfBuffer);
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
