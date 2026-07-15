import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Fallback for demo mode if keys are missing
      return NextResponse.json({ 
        error: 'Cloudinary credentials missing. Please use an unsigned upload preset instead.',
        cloudName 
      }, { status: 501 });
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    
    // Cloudinary signature generation
    const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}${apiSecret}`).digest('hex');

    return NextResponse.json({
      timestamp,
      signature,
      cloudName,
      apiKey
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
