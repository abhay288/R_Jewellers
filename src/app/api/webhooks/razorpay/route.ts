import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/shared/lib/mongodb';
import { SettingService } from '@/backend/services/SettingService';
import { OrderService } from '@/backend/services/OrderService';

import { getRazorpayWebhookSecret } from '@/shared/lib/razorpayConfig';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature header' }, { status: 400 });
    }

    await dbConnect();

    // 1. Resolve Razorpay Webhook Secret or Key Secret
    const webhookSecret = await getRazorpayWebhookSecret();
    if (!webhookSecret) {
      console.error('[Razorpay Webhook] No webhook/key secret configured. Rejecting request.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
    }

    // 2. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('[Razorpay Webhook Signature Mismatch]');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    const eventType = event.event;

    // Handle payment.captured or order.paid events idempotently
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || orderEntity?.notes || {};

      const userId = notes.userId;
      const addressId = notes.addressId;
      const couponCode = notes.couponCode;

      if (userId && addressId && razorpayOrderId && razorpayPaymentId) {
        const orderService = new OrderService();
        await orderService.confirmOnlineOrder(
          userId,
          addressId,
          razorpayOrderId,
          razorpayPaymentId,
          signature,
          couponCode
        );
        console.log(`[Razorpay Webhook] Successfully processed ${eventType} for order ${razorpayOrderId}`);
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: error?.message || 'Webhook Handler Error' }, { status: 500 });
  }
}
