export const dynamic = 'force-dynamic';

import connectDB from "@/shared/lib/mongodb";
import Category from "@/backend/models/Category";
import { CategoryForm } from "./CategoryForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const isNew = resolvedParams.id === "new";
  let category = null;

  await connectDB();

  if (!isNew) {
    category = await Category.findById(resolvedParams.id);
    if (!category) {
      notFound();
    }
  }

  // Fetch all categories for the parent selector (excluding the current one to prevent self-nesting)
  const query = isNew ? { isDeleted: { $ne: true } } : { _id: { $ne: resolvedParams.id }, isDeleted: { $ne: true } };
  const allCategories = await Category.find(query).select('_id name level').sort({ name: 1 });
  const parentCategories = allCategories.map(cat => ({
    id: cat._id.toString(),
    name: cat.name,
    level: cat.level
  }));

  const initialData = category ? {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    bannerImage: category.bannerImage || "",
    icon: category.icon || "",
    color: category.color || "",
    isActive: category.isActive,
    parentCategory: category.parentCategory ? category.parentCategory.toString() : "",
    seoTitle: category.seoTitle || "",
    seoDescription: category.seoDescription || "",
    seoKeywords: category.seoKeywords ? category.seoKeywords.join(", ") : "",
  } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/admin/categories" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">
            {isNew ? "Create Category" : "Edit Category"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? "Add a new product category to your store." : "Modify existing category details."}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        <CategoryForm initialData={initialData} parentCategories={parentCategories} />
      </div>
    </div>
  );
}
