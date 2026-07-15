import { NextResponse } from 'next/server';
import { OrderService } from '@/backend/services/OrderService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    // In a real app, verify Admin role here
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const orderService = new OrderService();
    const updatedOrder = await orderService.updateOrderStatus(
      resolvedParams.id, 
      status, 
      notes || `Status updated to ${status} by Admin`, 
      session.user.id
    );

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
