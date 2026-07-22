import { NextResponse } from 'next/server';
import dbConnect from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    await dbConnect();

    const searchRegex = new RegExp(query, 'i');

    const products = await Product.find({
      isActive: true,
      status: { $ne: 'Draft' },
      $or: [
        { name: searchRegex },
        { tags: searchRegex },
        { category: searchRegex },
        { material: searchRegex },
        { occasion: searchRegex },
      ],
    })
      .select('_id name slug price finalPrice images category stock')
      .limit(8)
      .lean();

    const suggestions = products.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug || p._id.toString(),
      price: p.price,
      finalPrice: p.finalPrice || p.price,
      image: p.images?.[0] || null,
      category: p.category || 'Jewellery',
      inStock: p.stock > 0,
    }));

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Search Suggestions API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
