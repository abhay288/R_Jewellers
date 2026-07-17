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

    const { weight, length, width, height } = await req.json();
    if (!weight || !length || !width || !height) {
      return NextResponse.json({ error: 'Package dimensions and weight are required' }, { status: 400 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const orderService = new OrderService();
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const shiprocketService = new ShiprocketService();
    const result = await shiprocketService.createShipment(order, { weight, length, width, height });

    // Update Order in MongoDB
    order.shipmentId = result.shipment_id;
    order.shipmentStatus = 'Created';
    order.trackingTimeline.push({
      status: 'Shipment Created',
      date: new Date(),
      note: `Shipment created via Shiprocket. Shipment ID: ${result.shipment_id}`,
    });
    await order.save();

    // Create OrderTimeline record
    await OrderTimeline.create({
      order: order._id,
      status: 'Packed', // packed state transition representation
      updatedBy: session.user.id,
      notes: `Shipment created via Shiprocket. ID: ${result.shipment_id}`,
    });

    return NextResponse.json({ success: true, shipmentId: result.shipment_id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
