import { NextResponse } from 'next/server';
import { OrderService } from '@/backend/services/OrderService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { couponCode, items } = await req.json();
    await dbConnect();
    
    const orderService = new OrderService();
    const totals = await orderService.calculateTotals(session.user.id, couponCode, items);
    
    return NextResponse.json(totals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
