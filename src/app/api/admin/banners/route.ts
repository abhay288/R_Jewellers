import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Banner from '@/backend/models/Banner';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const banners = await Banner.find({}).sort({ position: 1, createdAt: -1 });

    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error('Banners GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, subtitle, imageUrl, linkUrl, buttonText, position, isActive } = await req.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and Image URL are required' }, { status: 400 });
    }

    await dbConnect();

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      imageUrl,
      linkUrl: linkUrl || '/shop',
      buttonText: buttonText || 'Explore Collection',
      position: position !== undefined ? Number(position) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: any) {
    console.error('Banners POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create banner' }, { status: 500 });
  }
}
