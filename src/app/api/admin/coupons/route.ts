import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Coupon from '@/backend/models/Coupon';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      isActive,
      usageLimit,
    } = body;

    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return NextResponse.json({ error: 'Missing required coupon fields.' }, { status: 400 });
    }

    await dbConnect();

    const cleanCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usedCount: 0,
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
