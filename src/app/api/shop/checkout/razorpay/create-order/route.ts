import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import { SettingService } from '@/backend/services/SettingService';
import { OrderService } from '@/backend/services/OrderService';
import Address from '@/backend/models/Address';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId, couponCode, items } = await req.json();
    if (!addressId) {
      return NextResponse.json({ error: 'Address is required to initialize payment' }, { status: 400 });
    }

    await dbConnect();

    // 1. Validate shipping address
    const address = await Address.findOne({ _id: addressId, user: session.user.id });
    if (!address) {
      return NextResponse.json({ error: 'Selected shipping address not found' }, { status: 400 });
    }

    // 2. Calculate order totals and validate inventory/coupon (without saving order to MongoDB yet)
    const orderService = new OrderService();
    const totals = await orderService.calculateTotals(session.user.id, couponCode, items);

    // 3. Convert total amount to paise (₹ × 100)
    const originalAmountRupees = totals.totalAmount;
    const amountInPaise = Math.round(originalAmountRupees * 100);

    console.log(`[Razorpay Order Creation Audit] Gateway Order Initialization`);
    console.log(`  - Original amount (₹): ₹${originalAmountRupees}`);
    console.log(`  - Amount sent to Razorpay (paise): ${amountInPaise} paise`);

    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum payment amount required is ₹1' }, { status: 400 });
    }

    // 4. Resolve Razorpay API keys (from Admin Settings DB or Environment)
    const settingService = new SettingService();
    const dbKeyId = await settingService.getSettingByKey('razorpayKeyId', '');
    const dbKeySecret = await settingService.getSettingByKey('razorpayKeySecret', '');

    const sanitizeKey = (val: any) => {
      if (!val) return '';
      return String(val)
        .trim()
        .replace(/^["']|["']$/g, '')
        .trim();
    };

    let keyId = sanitizeKey(dbKeyId) || sanitizeKey(process.env.RAZORPAY_KEY_ID) || sanitizeKey(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    let keySecret = sanitizeKey(dbKeySecret) || sanitizeKey(process.env.RAZORPAY_KEY_SECRET);

    // Fallback to default test keys if neither is configured
    if (!keyId && !keySecret) {
      keyId = 'rzp_test_TEEygPJ4TOEaHW';
      keySecret = 'hXy0wKqwUDZDcWc3JCypSoet';
    }

    if (!keyId || !keySecret) {
      return NextResponse.json({
        error: `Razorpay API Key ${!keyId ? 'ID' : 'Secret'} is missing. Please update both Key ID and Key Secret in Admin Settings.`
      }, { status: 400 });
    }

    // 5. Create ONLY the Razorpay Gateway Order (no MongoDB order created yet!)
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `RJ_GWAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`.substring(0, 40);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        userId: String(session.user.id),
        addressId: String(addressId),
        couponCode: couponCode || ''
      }
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rpErr: any) {
      console.error('Razorpay API SDK Order Creation Error:', rpErr);
      const rpErrMsg = rpErr?.error?.description || rpErr?.description || rpErr?.message || 'Razorpay order creation failed';
      return NextResponse.json({ error: `Razorpay Error: ${rpErrMsg}. Please check Razorpay Key ID & Secret in Admin Settings.` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId
    });

  } catch (error: any) {
    console.error('Razorpay Gateway Order Creation Failure:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error creating payment order' }, { status: 500 });
  }
}
