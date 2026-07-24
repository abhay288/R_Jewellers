import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import { NotificationService } from '@/backend/services/NotificationService';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, type, link, targetGroup } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message content are required to broadcast notification.' }, { status: 400 });
    }

    await dbConnect();
    const service = new NotificationService();

    const result = await service.broadcastNotification(
      title,
      message,
      type || 'promo',
      link || '/shop',
      targetGroup || 'all'
    );

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Admin Broadcast API Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to broadcast notification' }, { status: 500 });
  }
}
