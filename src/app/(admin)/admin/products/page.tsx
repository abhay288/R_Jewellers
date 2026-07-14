import { DataTable } from "@/frontend/components/ui/data-table";
import { columns, ProductColumn } from "./columns";
import connectDB from "@/shared/lib/mongodb";
import Product from "@/backend/models/Product";
import Category from "@/backend/models/Category";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  await connectDB();
  
  const products = await Product.find()
    .populate({ path: 'category', select: 'name' })
    .sort({ createdAt: -1 });
  
  const formattedProducts: ProductColumn[] = products.map((prod) => ({
    id: prod._id.toString(),
    name: prod.name,
    sku: prod.sku || "",
    price: prod.finalPrice || prod.price,
    stock: prod.stock,
    isActive: prod.isActive,
    isFeatured: prod.isFeatured || false,
    category: (prod.category as any)?.name || "Uncategorized",
    image: prod.images?.[0] || "",
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your jewelry inventory and catalog.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <DataTable 
        columns={columns} 
        data={formattedProducts} 
        searchKey="name" 
        searchPlaceholder="Search products by name..."
      />
    </div>
  );
}
