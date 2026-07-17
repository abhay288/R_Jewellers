import { NextResponse } from 'next/server';
import { OrderService } from '@/backend/services/OrderService';
import { ShiprocketService } from '@/backend/services/ShiprocketService';
import logger from '@/shared/lib/logger';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function GET(
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

    if (!order.shipmentId) {
      return NextResponse.json({ error: 'Shipment has not been created yet' }, { status: 400 });
    }

    const shiprocketService = new ShiprocketService();
    
    let labelUrl = '';
    let manifestUrl = '';
    let errorMsg = '';

    try {
      labelUrl = await shiprocketService.generateLabel(order.shipmentId);
    } catch (err: any) {
      logger.error('Failed to generate label: ' + err.message);
      errorMsg += `Label error: ${err.message}. `;
    }

    try {
      manifestUrl = await shiprocketService.generateManifest(order.shipmentId);
    } catch (err: any) {
      logger.error('Failed to generate manifest: ' + err.message);
      errorMsg += `Manifest error: ${err.message}.`;
    }

    if (!labelUrl && !manifestUrl) {
      return NextResponse.json({ error: errorMsg || 'Failed to generate shipping documents' }, { status: 500 });
    }

    return NextResponse.json({ labelUrl, manifestUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
