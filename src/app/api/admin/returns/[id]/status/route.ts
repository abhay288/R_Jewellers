import { NextResponse } from 'next/server';
import { ReturnService } from '@/backend/services/ReturnService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
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
    const returnService = new ReturnService();
    const updatedReturn = await returnService.updateReturnStatus(
      resolvedParams.id, 
      status, 
      session.user.id,
      notes
    );

    return NextResponse.json(updatedReturn);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
