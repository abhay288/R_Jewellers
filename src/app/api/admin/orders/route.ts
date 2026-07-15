import { NextResponse } from 'next/server';
import { OrderService } from '@/backend/services/OrderService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    // In a real app, verify Admin role here
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All';

    await dbConnect();
    const orderService = new OrderService();
    const result = await orderService.getAdminOrders(page, limit, search, status);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
