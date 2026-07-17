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

    const { courierId, courierName, rate, etd } = await req.json();
    if (!courierId) {
      return NextResponse.json({ error: 'Courier ID is required' }, { status: 400 });
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
    const result = await shiprocketService.assignCourier(order.shipmentId, courierId);

    // Save details to Order
    order.awbNumber = result.awb_code;
    order.trackingNumber = result.awb_code;
    order.trackingUrl = `https://shiprocket.co/tracking/${result.awb_code}`;
    order.courierName = result.courier_name || courierName;
    order.courierId = courierId;
    order.shipmentStatus = 'AWB Assigned';
    
    // Store courier rate inside order delivery charges
    if (rate) {
      order.deliveryCharges = Number(rate);
    }
    
    if (etd) {
      const daysMatch = etd.match(/\d+/);
      const days = daysMatch ? parseInt(daysMatch[0], 10) : 5;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      order.estimatedDelivery = deliveryDate;
    }

    order.trackingTimeline.push({
      status: 'Courier Assigned',
      date: new Date(),
      note: `Courier partner assigned: ${order.courierName}. AWB: ${result.awb_code}`,
    });
    
    await order.save();

    await OrderTimeline.create({
      order: order._id,
      status: 'Packed',
      updatedBy: session.user.id,
      notes: `Courier ${order.courierName} assigned. AWB: ${result.awb_code}`,
    });

    return NextResponse.json({ 
      success: true, 
      awbNumber: result.awb_code, 
      courierName: order.courierName 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
