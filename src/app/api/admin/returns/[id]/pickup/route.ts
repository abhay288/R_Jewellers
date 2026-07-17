import { NextResponse } from 'next/server';
import { ReturnService } from '@/backend/services/ReturnService';
import { ShiprocketService } from '@/backend/services/ShiprocketService';
import { OrderService } from '@/backend/services/OrderService';
import Return from '@/backend/models/Return';
import ReturnTimeline from '@/backend/models/ReturnTimeline';
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
    const returnId = resolvedParams.id;

    const returnReq = await Return.findOne({ returnId }).populate('order');
    if (!returnReq) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    if (returnReq.status !== 'Approved') {
      return NextResponse.json({ error: 'Return request must be approved first' }, { status: 400 });
    }

    const orderService = new OrderService();
    const order = await orderService.getOrderById((returnReq.order as any).orderId);
    if (!order) {
      return NextResponse.json({ error: 'Original order not found' }, { status: 404 });
    }

    const shiprocketService = new ShiprocketService();
    const result = await shiprocketService.createReturnShipment(returnReq, order);

    returnReq.shipmentId = result.shipment_id;
    returnReq.awbNumber = result.awb_code;
    returnReq.trackingNumber = result.awb_code;
    returnReq.courierName = result.courier_name;
    returnReq.pickupStatus = 'Scheduled';
    returnReq.pickupDate = new Date();
    returnReq.status = 'Pickup Scheduled';

    await returnReq.save();

    await ReturnTimeline.create({
      return: returnReq._id,
      status: 'Pickup Scheduled',
      updatedBy: session.user.id,
      notes: `Return pickup scheduled via Shiprocket courier partner: ${result.courier_name}. AWB: ${result.awb_code}`,
    });

    return NextResponse.json({
      success: true,
      shipmentId: result.shipment_id,
      awbNumber: result.awb_code,
      courierName: result.courier_name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
