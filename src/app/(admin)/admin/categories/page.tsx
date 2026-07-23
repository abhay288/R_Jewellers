export const dynamic = 'force-dynamic';

import connectDB from "@/shared/lib/mongodb";
import Category from "@/backend/models/Category";
import Product from "@/backend/models/Product";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  await connectDB();
  
  const categories = await Category.find({ isDeleted: { $ne: true } })
    .populate('parentCategory', 'name')
    .sort({ level: 1, displayOrder: 1, name: 1 });

  // Calculate dynamic product count
  const productCounts = await Product.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);

  const countMap = new Map<string, number>();
  productCounts.forEach(pc => {
    if (pc._id) countMap.set(pc._id.toString(), pc.count);
  });

  const formattedCategories = categories.map((cat) => ({
    id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    bannerImage: cat.bannerImage || '',
    icon: cat.icon || '',
    color: cat.color || '',
    isActive: cat.isActive,
    isFeatured: cat.isFeatured || false,
    parentCategory: cat.parentCategory ? {
      id: (cat.parentCategory as any)._id.toString(),
      name: (cat.parentCategory as any).name
    } : null,
    level: cat.level || 0,
    productCount: countMap.get(cat._id.toString()) || 0,
    seoTitle: cat.seoTitle || '',
    seoDescription: cat.seoDescription || '',
    seoKeywords: cat.seoKeywords || [],
  }));

  return <CategoriesClient initialCategories={formattedCategories} />;
}
