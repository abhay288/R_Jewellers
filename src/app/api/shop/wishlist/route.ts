import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import { WishlistService } from '@/backend/services/WishlistService';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const service = new WishlistService();
    const wishlist = await service.getWishlist(session.user.id);
    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Wishlist GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectDB();
    const service = new WishlistService();
    const wishlist = await service.toggleItem(session.user.id, productId);
    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Wishlist POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
