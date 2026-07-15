import { NextResponse } from 'next/server';
import { ProductService } from '@/backend/services/ProductService';
import dbConnect from '@/backend/config/db';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const category = searchParams.get('category') || 'All';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const filters = {
      category,
      minPrice,
      maxPrice,
      search
    };

    const productService = new ProductService();
    const result = await productService.getStorefrontProducts(filters, sort, page, limit);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Products API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
