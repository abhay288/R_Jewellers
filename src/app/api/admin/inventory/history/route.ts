import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import { InventoryHistoryService } from '@/backend/services/InventoryHistoryService';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const service = new InventoryHistoryService();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const productId = searchParams.get('productId');
    const reason = searchParams.get('reason');

    let filter: any = {};
    if (productId) {
      filter.product = productId;
    }
    if (reason) {
      filter.reason = reason;
    }

    const history = await service.getHistory(filter, page, limit);
    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Inventory History API GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
