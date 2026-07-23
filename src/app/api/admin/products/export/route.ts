import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { format = 'csv', productIds, categoryId, brand, collectionName, status } = body;

    await connectDB();

    const query: any = { isDeleted: { $ne: true } };

    if (Array.isArray(productIds) && productIds.length > 0) {
      query._id = { $in: productIds };
    }
    if (categoryId) {
      query.category = categoryId;
    }
    if (brand) {
      query.brand = brand;
    }
    if (collectionName) {
      query.collectionName = collectionName;
    }
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    const exportRows = products.map((p) => ({
      'SKU': p.sku || '',
      'Product ID': p.productId || '',
      'Product Name': p.name || '',
      'Slug': p.slug || '',
      'Category': (p.category as any)?.name || 'Uncategorized',
      'Sub Category': p.subcategory || '',
      'Brand': p.brand || 'Radhika Jewellers',
      'Collection': p.collectionName || '',
      'Price': p.price || 0,
      'MRP': p.mrp || 0,
      'Discount': p.discount || 0,
      'Stock': p.stock || 0,
      'Minimum Stock': p.minimumStock || 2,
      'Weight': p.weight || '',
      'Dimensions': p.dimensions || '',
      'Material': p.material || '',
      'Stone Type': p.stoneType || p.stone || '',
      'Color': p.color || '',
      'Finish': p.finish || '',
      'Occasion': p.occasion || '',
      'Gender': p.gender || 'Women',
      'Style': p.style || '',
      'Short Description': p.shortDescription || '',
      'Long Description': p.description || '',
      'Features': Array.isArray(p.features) ? p.features.join(', ') : '',
      'Care Instructions': p.careInstructions || '',
      'Shipping Information': p.shippingInfo || '',
      'Return Policy': p.returnPolicy || '',
      'Warranty': p.warranty || '',
      'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : '',
      'Featured': p.isFeatured ? 'TRUE' : 'FALSE',
      'Trending': p.isTrending ? 'TRUE' : 'FALSE',
      'Best Seller': p.isBestSeller ? 'TRUE' : 'FALSE',
      'New Arrival': p.isNewArrival ? 'TRUE' : 'FALSE',
      'Active': p.isActive ? 'TRUE' : 'FALSE',
      'SEO Title': p.seoTitle || '',
      'SEO Description': p.seoDescription || '',
      'SEO Keywords': Array.isArray(p.metaKeywords) ? p.metaKeywords.join(', ') : '',
      'Image Folder': p.imageFolder || p.sku || '',
      'Video Folder': p.videoFolder || p.sku || '',
    }));

    if (format === 'excel' || format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Radhika_Jewellers_Products_${Date.now()}.xlsx"`,
        },
      });
    } else {
      const csvString = Papa.unparse(exportRows);
      return new Response(csvString, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Radhika_Jewellers_Products_${Date.now()}.csv"`,
        },
      });
    }
  } catch (error: any) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error during export' }, { status: 500 });
  }
}
