import { NextResponse } from 'next/server';
import { ContactMessageService } from '@/backend/services/ContactMessageService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await dbConnect();
    const contactService = new ContactMessageService();
    const updated = await contactService.markAsRead(id);

    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update message' },
      { status: 500 }
    );
  }
}
