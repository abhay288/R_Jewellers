export const dynamic = 'force-dynamic';

import connectDB from "@/shared/lib/mongodb";
import Product from "@/backend/models/Product";
import Category from "@/backend/models/Category";
import { ProductForm } from "./ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductEditPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ duplicate?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const isNew = resolvedParams.id === "new";
  const duplicateId = resolvedSearchParams?.duplicate;
  let product = null;

  await connectDB();
  const categories = await Category.find({ isActive: true }).select('name _id');

  if (!isNew) {
    product = await Product.findById(resolvedParams.id);
    if (!product) notFound();
  } else if (duplicateId) {
    product = await Product.findById(duplicateId);
    if (product) {
      // Clear specific fields for duplication
      (product as any)._id = undefined;
      product.name = `${product.name} (Copy)`;
      product.slug = "";
      product.sku = "";
    }
  }

  const initialData = product ? {
    id: product._id ? product._id.toString() : undefined,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category.toString(),
    subcategory: product.subcategory || "",
    brand: product.brand || "",
    price: product.price,
    discount: product.discount || 0,
    stock: product.stock,
    sku: product.sku || "",
    material: product.material || "",
    weight: product.weight || "",
    color: product.color || "",
    occasion: product.occasion || "",
    images: product.images || [],
    image360: product.image360 || "",
    videoUrl: product.videoUrl || "",
    isActive: product.isActive,
    isFeatured: product.isFeatured || false,
    isBestSeller: product.isBestSeller || false,
    isTrending: product.isTrending || false,
    tags: product.tags || [],
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
          <h1 className="text-3xl font-playfair font-bold text-foreground">
            {isNew ? "Add Product" : "Edit Product"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? "Create a new product listing in your catalog." : "Modify product details, pricing, and media."}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <ProductForm initialData={initialData} categories={formattedCategories} />
      </div>
    </div>
  );
}
