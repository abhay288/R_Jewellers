import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import Category from '@/backend/models/Category';
import Product from '@/backend/models/Product';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectDB();
    const categories = await Category.find({ isDeleted: { $ne: true } })
      .populate('parentCategory', 'name')
      .sort({ level: 1, displayOrder: 1, name: 1 });

    // Aggregate dynamic product counts per category
    const productCounts = await Product.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap = new Map<string, number>();
    productCounts.forEach(pc => {
      if (pc._id) countMap.set(pc._id.toString(), pc.count);
    });

    const result = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      bannerImage: cat.bannerImage || '',
      icon: cat.icon || '',
      color: cat.color || '',
      isActive: cat.isActive,
      isFeatured: cat.isFeatured,
      parentCategory: cat.parentCategory ? {
        id: (cat.parentCategory as any)._id.toString(),
        name: (cat.parentCategory as any).name
      } : null,
      level: cat.level || 0,
      displayOrder: cat.displayOrder || 0,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
      seoKeywords: cat.seoKeywords || [],
      productCount: countMap.get(cat._id.toString()) || 0,
      createdAt: cat.createdAt,
    }));

    return NextResponse.json({ success: true, categories: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, description, bannerImage, icon, color, isActive, isFeatured, parentCategory, seoTitle, seoDescription, seoKeywords } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    await connectDB();

    let level = 0;
    let parentObjId: mongoose.Types.ObjectId | null = null;

    if (parentCategory && parentCategory !== 'none') {
      const parentCat = await Category.findById(parentCategory);
      if (parentCat) {
        level = (parentCat.level || 0) + 1;
        parentObjId = parentCat._id as mongoose.Types.ObjectId;
      }
    }

    const generatedSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const newCategory = await Category.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description ? description.trim() : undefined,
      bannerImage,
      icon,
      color,
      isActive: isActive !== false,
      isFeatured: Boolean(isFeatured),
      parentCategory: parentObjId || undefined,
      level,
      seoTitle: seoTitle || `${name} Collection | Radhika Jewellers`,
      seoDescription: seoDescription || `Explore handcrafted ${name} at Radhika Jewellers. Best prices, authentic hallmark quality.`,
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : (seoKeywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, slug, description, bannerImage, icon, color, isActive, isFeatured, parentCategory, seoTitle, seoDescription, seoKeywords } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    await connectDB();

    let level = 0;
    let parentObjId: mongoose.Types.ObjectId | null = null;

    if (parentCategory && parentCategory !== 'none') {
      const parentCat = await Category.findById(parentCategory);
      if (parentCat) {
        level = (parentCat.level || 0) + 1;
        parentObjId = parentCat._id as mongoose.Types.ObjectId;
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name.trim(),
          slug: (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          description: description ? description.trim() : undefined,
          bannerImage,
          icon,
          color,
          isActive: Boolean(isActive),
          isFeatured: Boolean(isFeatured),
          parentCategory: parentObjId || undefined,
          level,
          seoTitle,
          seoDescription,
          seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : (seoKeywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
        }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    await connectDB();
    await Category.findByIdAndUpdate(id, { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
