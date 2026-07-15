import { NextResponse } from 'next/server';
import { ReturnService } from '@/backend/services/ReturnService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { itemsQC } = body;

    if (!itemsQC || !Array.isArray(itemsQC)) {
      return NextResponse.json({ error: 'Valid itemsQC array is required' }, { status: 400 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const returnService = new ReturnService();
    const updatedReturn = await returnService.processQualityCheck(
      resolvedParams.id, 
      session.user.id,
      itemsQC
    );

    return NextResponse.json(updatedReturn);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
