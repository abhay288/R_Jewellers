import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import { SettingService } from '@/backend/services/SettingService';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const service = new SettingService();
    const settings = await service.getAllSettings();

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { settings, group } = await request.json();
    if (!settings || !group) {
      return NextResponse.json({ error: 'Missing settings or group' }, { status: 400 });
    }

    await connectDB();
    const service = new SettingService();
    const updated = await service.updateSettings(settings, group);

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Settings POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
