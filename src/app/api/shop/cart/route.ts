import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import { CartService } from '@/backend/services/CartService';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const service = new CartService();
    const cart = await service.getCart(session.user.id);
    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Cart GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Merge or add item
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, items, productId, quantity } = await request.json();
    await connectDB();
    const service = new CartService();

    if (action === 'merge' && Array.isArray(items)) {
      const cart = await service.syncCart(session.user.id, items);
      return NextResponse.json(cart);
    }

    if (productId && quantity !== undefined) {
      const cart = await service.updateItemQuantity(session.user.id, productId, quantity);
      return NextResponse.json(cart);
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Cart POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    await connectDB();
    const service = new CartService();

    if (productId) {
      const cart = await service.removeItem(session.user.id, productId);
      return NextResponse.json(cart);
    } else {
      // Clear all
      const cart = await service.clearCart(session.user.id);
      return NextResponse.json(cart);
    }
  } catch (error: any) {
    console.error('Cart DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
