import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import { ProductService } from '@/backend/services/ProductService';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const service = new ProductService();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'dashboardStats') {
      const stats = await service.getInventoryDashboardStats();
      return NextResponse.json(stats);
    }
    
    // Default GET for paginated products list for inventory dashboard
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const filter: any = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (status) {
      filter.status = status;
    }

    const products = await service.getProductsForInventory(filter, page, limit);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Inventory API GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, changeQuantity, reason, notes } = body;

    if (!productId || changeQuantity === undefined || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const service = new ProductService();

    const updatedProduct = await service.adjustStock(
      productId, 
      Number(changeQuantity), 
      reason, 
      session.user.id, 
      notes
    );

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Inventory API PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
