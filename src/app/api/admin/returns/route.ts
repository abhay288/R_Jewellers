import { NextResponse } from 'next/server';
import { ReturnService } from '@/backend/services/ReturnService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All';

    const query: any = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { returnId: { $regex: search, $options: 'i' } },
        { upiDetails: { $regex: search, $options: 'i' } }
        // Note: searching across orders/users requires aggregate lookup, simplified for now
      ];
    }

    await dbConnect();
    const returnService = new ReturnService();
    const result = await returnService.getReturns(query, page, limit);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
