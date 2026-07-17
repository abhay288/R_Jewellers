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

    const { pickupDate } = await req.json();
    if (!pickupDate) {
      return NextResponse.json({ error: 'Pickup date is required' }, { status: 400 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const orderService = new OrderService();
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.shipmentId) {
      return NextResponse.json({ error: 'Shipment has not been created yet' }, { status: 400 });
    }

    const shiprocketService = new ShiprocketService();
    const result = await shiprocketService.schedulePickup(order.shipmentId, pickupDate);

    // Save details to Order
    order.pickupId = result.pickup_id;
    order.pickupStatus = result.pickup_status;
    order.shipmentStatus = 'Pickup Scheduled';
    
    order.trackingTimeline.push({
      status: 'Pickup Scheduled',
      date: new Date(),
      note: `Pickup scheduled for date: ${pickupDate}. Status: ${result.pickup_status}`,
    });
    
    await order.save();

    await OrderTimeline.create({
      order: order._id,
      status: 'Packed',
      updatedBy: session.user.id,
      notes: `Pickup scheduled for ${pickupDate}. Pickup ID: ${result.pickup_id}`,
    });

    return NextResponse.json({ 
      success: true, 
      pickupId: result.pickup_id, 
      pickupStatus: result.pickup_status 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
