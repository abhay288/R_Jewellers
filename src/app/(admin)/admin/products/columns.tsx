"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash, Copy, Star, Flame, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { deleteProduct, toggleProductStatus } from "@/backend/actions/product.actions";
import { SortableHeader } from "@/frontend/components/ui/data-table";
import Image from "next/image";

export type ProductColumn = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  category: string;
  brand: string;
  image: string;
  slug: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        aria-label="Select all"
        className="w-4 h-4 accent-primary rounded cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        aria-label="Select row"
        className="w-4 h-4 accent-primary rounded cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "Media",
    cell: ({ row }) => {
      const img = row.getValue("image") as string;
      return (
        <div className="relative w-12 h-12 rounded-xl border border-border overflow-hidden bg-secondary shrink-0 shadow-sm">
          {img ? (
            <Image src={img} fill alt="Product" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground font-mono">No Img</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Product Info" />,
    cell: ({ row }) => (
      <div className="max-w-xs">
        <Link href={`/product/${row.original.slug}`} target="_blank" className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
          {row.getValue("name")}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
          <span>SKU: {row.original.sku || "N/A"}</span>
          <span>•</span>
          <span>ID: {row.original.productId || "N/A"}</span>
        </div>
        {/* Badges */}
        <div className="flex items-center gap-1 mt-1">
          {row.original.isFeatured && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-current" /> Featured
            </span>
          )}
          {row.original.isTrending && (
            <span className="px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-semibold flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-current" /> Trending
            </span>
          )}
          {row.original.isNewArrival && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category & Brand",
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-medium text-foreground">{row.getValue("category")}</div>
        <div className="text-xs text-muted-foreground">{row.original.brand}</div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => <SortableHeader column={column} title="Pricing" />,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const mrp = row.original.mrp;
      return (
        <div>
          <div className="font-bold text-foreground">₹{price.toLocaleString('en-IN')}</div>
          {mrp > price && (
            <div className="text-xs text-muted-foreground line-through">₹{mrp.toLocaleString('en-IN')}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <SortableHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stock <= 2 ? 'bg-red-500/15 text-red-600' : stock <= 5 ? 'bg-amber-500/15 text-amber-600' : 'bg-emerald-500/15 text-emerald-600'}`}>
          {stock > 0 ? `${stock} in stock` : 'Out of Stock'}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <button 
          onClick={async () => {
            await toggleProductStatus(product.id, !product.isActive);
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${product.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-red-500/10 hover:text-red-600' : 'bg-red-500/10 text-red-600 hover:bg-emerald-500/10 hover:text-emerald-600'}`}
          title="Click to toggle status"
        >
          {product.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {product.isActive ? "Published" : "Inactive"}
        </button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="flex items-center space-x-1">
          <a
            href={`/admin/products/${product.id}`}
            className="p-2 hover:bg-amber-500/10 rounded-lg text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
            title="Edit Product"
          >
            <Pencil className="w-4 h-4" />
          </a>
          <a
            href={`/admin/products/new?duplicate=${product.id}`}
            className="p-2 hover:bg-blue-500/10 rounded-lg text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer"
            title="Duplicate Product"
          >
            <Copy className="w-4 h-4" />
          </a>
          <button 
            onClick={async () => {
              if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                const res = await deleteProduct(product.id);
                if (res?.success) {
                  window.location.reload();
                } else {
                  alert(res?.error || "Failed to delete product");
                }
              }
            }}
            className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];
