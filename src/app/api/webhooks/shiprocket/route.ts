import { NextResponse } from 'next/server';
import Order from '@/backend/models/Order';
import Return from '@/backend/models/Return';
import OrderTimeline from '@/backend/models/OrderTimeline';
import ReturnTimeline from '@/backend/models/ReturnTimeline';
import { NotificationService } from '@/backend/services/NotificationService';
import { EmailService } from '@/backend/services/EmailService';
import User from '@/backend/models/User';
import dbConnect from '@/shared/lib/mongodb';
import logger from '@/shared/lib/logger';

// Maps Shiprocket status to Radhika Jewellers Order status
const mapStatus = (shiprocketStatus: string): 'Order Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Returned' | '' => {
  const status = shiprocketStatus.toLowerCase();
  if (status.includes('delivered')) return 'Delivered';
  if (status.includes('out for delivery') || status.includes('outfordelivery')) return 'Out For Delivery';
  if (status.includes('shipped') || status.includes('in transit') || status.includes('picked up') || status.includes('intransit')) return 'Shipped';
  if (status.includes('pickup scheduled') || status.includes('pickup_scheduled')) return 'Packed';
  if (status.includes('cancelled')) return 'Cancelled';
  if (status.includes('returned') || status.includes('rto')) return 'Returned';
  return '';
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    logger.info(`Shiprocket Webhook Received: ${JSON.stringify(body)}`);

    const { awb, current_status, current_location, current_timestamp } = body;

    if (!awb) {
      return NextResponse.json({ error: 'AWB number is missing' }, { status: 400 });
    }

    await dbConnect();
    const notificationService = new NotificationService();
    const emailService = new EmailService();

    // 1. Try to find Order by AWB
    const order = await Order.findOne({ awbNumber: awb });

    if (order) {
      const mappedStatus = mapStatus(current_status);
      const isStatusChanged = mappedStatus && order.status !== mappedStatus;

      order.shipmentStatus = current_status;
      order.lastTrackingUpdate = new Date();

      if (isStatusChanged) {
        const oldStatus = order.status;
        order.status = mappedStatus as any;

        if (mappedStatus === 'Delivered') {
          order.returnEligibilityDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
        }

        const note = `Status updated via Shiprocket Webhook. Location: ${current_location || 'N/A'}`;
        order.trackingTimeline.push({
          status: mappedStatus,
          date: current_timestamp ? new Date(current_timestamp) : new Date(),
          note
        });

        await order.save();

        // Create standalone timeline record
        await OrderTimeline.create({
          order: order._id,
          status: mappedStatus,
          updatedBy: 'Shiprocket Webhook',
          notes: note
        });

        // Trigger notifications and email
        try {
          notificationService.sendOrderStatusNotification(order.user.toString(), order.orderId, mappedStatus);
          
          const userObj = await User.findById(order.user);
          if (userObj) {
            await emailService.sendOrderStatusChangedEmail(userObj.email, userObj.name, order.orderId, mappedStatus);
          }
        } catch (err: any) {
          logger.error(`Webhook notification trigger failed: ${err.message}`);
        }
      } else {
        // Just save shipment status updates even if core status doesn't change
        await order.save();
      }

      return NextResponse.json({ success: true, type: 'order' });
    }

    // 2. Try to find Return by AWB
    const returnReq = await Return.findOne({ awbNumber: awb }).populate('order');
    if (returnReq) {
      const statusLower = current_status.toLowerCase();
      let returnStatus = '';

      if (statusLower.includes('delivered') || statusLower.includes('received')) {
        returnStatus = 'Received';
      } else if (statusLower.includes('picked up') || statusLower.includes('picked_up')) {
        returnStatus = 'Picked Up';
      } else if (statusLower.includes('pickup scheduled')) {
        returnStatus = 'Pickup Scheduled';
      }

      if (returnStatus && returnReq.status !== returnStatus) {
        returnReq.status = returnStatus as any;
        returnReq.pickupStatus = current_status;
        await returnReq.save();

        await ReturnTimeline.create({
          return: returnReq._id,
          status: returnStatus,
          updatedBy: 'Shiprocket Webhook',
          notes: `Status updated to ${returnStatus} via Shiprocket. Location: ${current_location || 'N/A'}`
        });

        // Notify customer
        try {
          notificationService.createNotification(
            returnReq.user.toString(),
            `Return Request ${returnStatus}`,
            `Your return package status is: ${returnStatus}.`,
            'order',
            `/profile/returns/${returnReq.returnId}`
          );
        } catch (err: any) {
          logger.error(`Webhook return notification failed: ${err.message}`);
        }
      }

      return NextResponse.json({ success: true, type: 'return' });
    }

    return NextResponse.json({ warning: 'AWB not matching any orders or returns' }, { status: 200 });

  } catch (error: any) {
    logger.error(`Webhook handler failed: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
