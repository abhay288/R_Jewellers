import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/shared/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  } catch (error: any) {
    console.error('Health Check Error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
