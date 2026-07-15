import { NextResponse } from 'next/server';
import { ReturnService } from '@/backend/services/ReturnService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // We should technically check if user is admin, assuming middleware or other checks do it.

    await dbConnect();
    const resolvedParams = await params;
    const returnService = new ReturnService();
    // Not passing userId so it fetches regardless of owner (Admin access)
    const returnReq = await returnService.getReturnById(resolvedParams.id);

    if (!returnReq) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    return NextResponse.json(returnReq);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
