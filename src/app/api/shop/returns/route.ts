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

    await dbConnect();
    const returnService = new ReturnService();
    const result = await returnService.getReturns({ user: session.user.id }, page, limit);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, products, reason, notes, images, upiId } = body;

    if (!orderId || !products || !reason || !upiId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const returnService = new ReturnService();
    const newReturn = await returnService.createReturnRequest(
      session.user.id,
      orderId,
      products,
      reason,
      notes || '',
      images || [],
      upiId
    );

    return NextResponse.json(newReturn, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
