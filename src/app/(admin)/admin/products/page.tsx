export const dynamic = 'force-dynamic';

import connectDB from "@/shared/lib/mongodb";
import Product from "@/backend/models/Product";
import Category from "@/backend/models/Category";
import ProductsClient from "./ProductsClient";
import { ProductColumn } from "./columns";

export default async function ProductsPage() {
  await connectDB();
  
  const [products, categories] = await Promise.all([
    Product.find({ isDeleted: { $ne: true } })
      .populate({ path: 'category', select: 'name' })
      .sort({ createdAt: -1 }),
    Category.find({ isDeleted: { $ne: true } }, '_id name').sort({ name: 1 })
  ]);
  
  const formattedProducts: ProductColumn[] = products.map((prod) => ({
    id: prod._id.toString(),
    productId: prod.productId || "",
    name: prod.name,
    sku: prod.sku || "",
    price: prod.finalPrice || prod.price,
    mrp: prod.mrp || prod.price,
    stock: prod.stock,
    isActive: prod.isActive,
    isFeatured: prod.isFeatured || false,
    isTrending: prod.isTrending || false,
    isNewArrival: prod.isNewArrival || false,
    category: (prod.category as any)?.name || "Uncategorized",
    brand: prod.brand || "Radhika Jewellers",
    image: prod.images?.[0] || "",
    slug: prod.slug || "",
  }));

  const formattedCategories = categories.map(c => ({
    id: c._id.toString(),
    name: c.name,
  }));

  return <ProductsClient products={formattedProducts} categories={formattedCategories} />;
}
