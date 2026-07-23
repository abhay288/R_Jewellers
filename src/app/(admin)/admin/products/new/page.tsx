export const dynamic = 'force-dynamic';

import connectDB from "@/shared/lib/mongodb";
import Category from "@/backend/models/Category";
import Product from "@/backend/models/Product";
import { ProductForm } from "../[id]/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicate?: string }>
}) {
  await connectDB();
  const resolvedSearchParams = await searchParams;
  const duplicateId = resolvedSearchParams?.duplicate;

  const categories = await Category.find({ isDeleted: { $ne: true } })
    .select('name _id')
    .sort({ name: 1 });

  let product = null;
  if (duplicateId) {
    product = await Product.findById(duplicateId);
    if (product) {
      (product as any)._id = undefined;
      product.name = `${product.name} (Copy)`;
      product.slug = "";
      product.sku = "";
    }
  }

  const initialData = product ? {
    id: undefined,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription || "",
    category: product.category ? product.category.toString() : "",
    subcategory: product.subcategory || "",
    collectionName: product.collectionName || "",
    brand: product.brand || "Radhika Jewellers",
    price: product.price,
    mrp: product.mrp || product.price,
    discount: product.discount || 0,
    stock: product.stock,
    sku: "",
    material: product.material || "",
    stone: product.stone || "",
    weight: product.weight || "",
    dimensions: product.dimensions || "",
    color: product.color || "",
    gender: product.gender || "Women",
    occasion: product.occasion || "",
    style: product.style || "",
    images: product.images || [],
    image360: product.image360 || "",
    videoUrl: product.videoUrl || "",
    isActive: product.isActive,
    isFeatured: product.isFeatured || false,
    isBestSeller: product.isBestSeller || false,
    isTrending: product.isTrending || false,
    isNewArrival: product.isNewArrival || true,
    tags: product.tags || [],
    careInstructions: product.careInstructions || "",
    shippingInfo: product.shippingInfo || "",
    returnPolicy: product.returnPolicy || "",
    warranty: product.warranty || "",
    seoTitle: product.seoTitle || "",
    seoDescription: product.seoDescription || "",
    metaKeywords: product.metaKeywords || [],
  } : null;

  const formattedCategories = categories.map(c => ({
    id: c._id.toString(),
    name: c.name
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center space-x-4">
        <Link href="/admin/products" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Add Product</h1>
          <p className="text-muted-foreground mt-1">Create a new product listing in your catalog.</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <ProductForm initialData={initialData} categories={formattedCategories} />
      </div>
    </div>
  );
}
