import { NextResponse } from 'next/server';
import dbConnect from '@/shared/lib/mongodb';
import Banner from '@/backend/models/Banner';

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find({ isActive: true }).sort({ position: 1, createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error('Public Banners GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch shop banners' }, { status: 500 });
  }
}
