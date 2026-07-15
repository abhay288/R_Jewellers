import { NextResponse } from 'next/server';
import { OrderService } from '@/backend/services/OrderService';
import dbConnect from '@/shared/lib/mongodb';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId, couponCode, paymentMethod } = await req.json();
    
    if (!addressId) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    await dbConnect();
    
    const orderService = new OrderService();
    const order = await orderService.placeOrder(
      session.user.id, 
      addressId, 
      couponCode, 
      paymentMethod
    );
    
    return NextResponse.json({ success: true, orderId: order.orderId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
