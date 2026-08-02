import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Razorpay from 'razorpay';

import { sanitizeKey } from '@/shared/lib/razorpayConfig';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyId: rawKeyId, keySecret: rawKeySecret } = await req.json();

    const keyId = sanitizeKey(rawKeyId);
    const keySecret = sanitizeKey(rawKeySecret);

    if (!keyId || !keySecret) {
      return NextResponse.json({
        success: false,
        error: 'Both Razorpay Key ID and Key Secret are required to test authentication.'
      }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Test authentication by attempting a lightweight API call (e.g. fetching 1 dummy order)
    try {
      await razorpay.orders.all({ count: 1 });
      const mode = keyId.startsWith('rzp_live_') ? 'Live Mode' : keyId.startsWith('rzp_test_') ? 'Test Mode' : 'Custom Mode';
      return NextResponse.json({
        success: true,
        message: `Razorpay authentication successful! Credentials are valid (${mode}).`
      });
    } catch (rpErr: any) {
      console.error('Razorpay test credentials error:', rpErr);
      const rpErrMsg = rpErr?.error?.description || rpErr?.description || rpErr?.message || 'Authentication failed';
      return NextResponse.json({
        success: false,
        error: `Razorpay Error: ${rpErrMsg}. Please check that your Key ID and Key Secret match from the same Razorpay mode.`
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Test Razorpay Credentials Failure:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error testing credentials' }, { status: 500 });
  }
}
