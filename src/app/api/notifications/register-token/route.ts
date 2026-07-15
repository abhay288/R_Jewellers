import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import DeviceToken from '@/backend/models/DeviceToken';

export async function POST(request: Request) {
  try {
    const { token, deviceType } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await connectDB();
    const session = await auth();
    const userId = session?.user?.id;

    // Save or update the device token
    const updatedToken = await DeviceToken.findOneAndUpdate(
      { token },
      { 
        user: userId || null, 
        deviceType: deviceType || 'unknown' 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, token: updatedToken });
  } catch (error: any) {
    console.error('Register Token API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
