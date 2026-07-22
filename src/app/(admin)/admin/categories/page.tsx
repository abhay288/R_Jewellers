export const dynamic = 'force-dynamic';

import { DataTable } from "@/frontend/components/ui/data-table";
import { columns, CategoryColumn } from "./columns";
import connectDB from "@/shared/lib/mongodb";
import Category from "@/backend/models/Category";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CategoryExportButton } from "./CategoryExportButton";

export default async function CategoriesPage() {
  await connectDB();
  
  // Exclude soft-deleted categories and sort by name/level to show hierarchy
  const categories = await Category.find({ isDeleted: { $ne: true } })
    .sort({ level: 1, displayOrder: 1, name: 1 });
  
  const formattedCategories: CategoryColumn[] = categories.map((cat) => ({
    id: cat._id.toString(),
    name: cat.name,
    slug: cat.slug,
    level: cat.level || 0,
    isActive: cat.isActive,
    viewCount: cat.viewCount || 0,
    createdAt: new Date(cat.createdAt).toLocaleDateString(),
  }));


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage your product categories and collections.</p>
        </div>
        <div className="flex items-center space-x-2">
          <CategoryExportButton data={formattedCategories} />
          <Link 
            href="/admin/categories/new" 
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Link>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={formattedCategories} 
        searchKey="name" 
        searchPlaceholder="Search categories..."
      />
    </div>
  );
}
