import { NextResponse } from 'next/server';
import Order from '@/backend/models/Order';
import Return from '@/backend/models/Return';
import { ShiprocketService } from '@/backend/services/ShiprocketService';
import { NotificationService } from '@/backend/services/NotificationService';
import { EmailService } from '@/backend/services/EmailService';
import User from '@/backend/models/User';
import dbConnect from '@/shared/lib/mongodb';
import logger from '@/shared/lib/logger';

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const trackingNumber = resolvedParams.trackingNumber;

    const order = await Order.findOne({
      $or: [{ awbNumber: trackingNumber }, { trackingNumber }]
    }).populate('shippingAddress');

    const notificationService = new NotificationService();
    const emailService = new EmailService();

    if (order) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const isCacheValid = order.lastTrackingUpdate && order.lastTrackingUpdate > tenMinutesAgo;

      if (!isCacheValid) {
        try {
          const shiprocketService = new ShiprocketService();
          const trackingData = await shiprocketService.trackShipment(trackingNumber);

          if (trackingData) {
            const rawStatus = trackingData.shipment_status || '';
            const mappedStatus = mapStatus(rawStatus);
            const isStatusChanged = mappedStatus && order.status !== mappedStatus;

            order.shipmentStatus = rawStatus;
            order.lastTrackingUpdate = new Date();

            if (trackingData.etd) {
              order.estimatedDelivery = new Date(trackingData.etd);
            }

            if (isStatusChanged) {
              order.status = mappedStatus as any;
              if (mappedStatus === 'Delivered') {
                order.returnEligibilityDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
              }

              order.trackingTimeline.push({
                status: mappedStatus,
                date: new Date(),
                note: `Status updated via live poll. Activity: ${rawStatus}`
              });

              try {
                notificationService.sendOrderStatusNotification(order.user.toString(), order.orderId, mappedStatus);
                const userObj = await User.findById(order.user);
                if (userObj) {
                  await emailService.sendOrderStatusChangedEmail(userObj.email, userObj.name, order.orderId, mappedStatus);
                }
              } catch (notifyErr: any) {
                logger.error('Failed to notify client during live tracking poll: ' + notifyErr.message);
              }
            }

            await order.save();
          }
        } catch (pollErr: any) {
          logger.warn(`Could not poll live tracking status from Shiprocket: ${pollErr.message}`);
        }
      }

      return NextResponse.json({
        type: 'order',
        orderId: order.orderId,
        shipmentId: order.shipmentId,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName || 'Blue Dart',
        estimatedDelivery: order.estimatedDelivery,
        status: order.status,
        shipmentStatus: order.shipmentStatus,
        shippingAddress: order.shippingAddress,
        trackingTimeline: order.trackingTimeline,
        lastTrackingUpdate: order.lastTrackingUpdate,
      });
    }

    const returnReq = await Return.findOne({
      $or: [{ awbNumber: trackingNumber }, { trackingNumber }]
    }).populate('order');

    if (returnReq) {
      return NextResponse.json({
        type: 'return',
        returnId: returnReq.returnId,
        shipmentId: returnReq.shipmentId,
        trackingNumber: returnReq.trackingNumber,
        courierName: returnReq.courierName || 'Shiprocket Return Partner',
        status: returnReq.status,
        pickupStatus: returnReq.pickupStatus,
        pickupDate: returnReq.pickupDate,
      });
    }

    return NextResponse.json({ error: 'Tracking number not found' }, { status: 404 });

  } catch (error: any) {
    logger.error('Live tracking API failure: ' + error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
