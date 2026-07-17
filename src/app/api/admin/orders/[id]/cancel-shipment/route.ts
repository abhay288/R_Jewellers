import { NextResponse } from 'next/server';
import { OrderService } from '@/backend/services/OrderService';
import { ShiprocketService } from '@/backend/services/ShiprocketService';
import Order from '@/backend/models/Order';
import OrderTimeline from '@/backend/models/OrderTimeline';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const orderService = new OrderService();
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.awbNumber) {
      return NextResponse.json({ error: 'No shipment has been shipped/assigned yet' }, { status: 400 });
    }

    const shiprocketService = new ShiprocketService();
    const success = await shiprocketService.cancelShipment(order.awbNumber);

    if (!success) {
      return NextResponse.json({ error: 'Shiprocket rejected shipment cancellation request' }, { status: 500 });
    }

    // Update order status in MongoDB
    order.shipmentStatus = 'Cancelled';
    order.trackingTimeline.push({
      status: 'Shipment Cancelled',
      date: new Date(),
      note: `Shiprocket shipment with AWB ${order.awbNumber} has been cancelled by Admin.`,
    });
    
    // Clear out shipment fields so admin can recreate shipment if needed
    const oldAwb = order.awbNumber;
    order.awbNumber = undefined;
    order.shipmentId = undefined;
    order.pickupId = undefined;
    order.pickupStatus = undefined;
    order.trackingNumber = undefined;
    order.trackingUrl = undefined;
    
    await order.save();

    await OrderTimeline.create({
      order: order._id,
      status: 'Packed', 
      updatedBy: session.user.id,
      notes: `Shiprocket shipment cancelled (AWB: ${oldAwb}).`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
