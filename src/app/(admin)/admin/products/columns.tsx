"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash, Copy } from "lucide-react";
import Link from "next/link";
import { deleteProduct, toggleProductStatus } from "@/backend/actions/product.actions";
import { SortableHeader } from "@/frontend/components/ui/data-table";
import Image from "next/image";

export type ProductColumn = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category: string;
  image: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const img = row.getValue("image") as string;
      return (
        <div className="relative w-12 h-12 rounded-lg border border-border overflow-hidden bg-secondary">
          {img ? (
            <Image src={img} fill alt="Product" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">No Img</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Product" />,
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-foreground">{row.getValue("name")}</div>
        <div className="text-xs text-muted-foreground">SKU: {row.original.sku || "N/A"}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div className="text-muted-foreground text-sm">{row.getValue("category")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => <SortableHeader column={column} title="Price" />,
    cell: ({ row }) => <div className="font-medium">₹${(row.getValue("price") as number).toFixed(2)}</div>,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <SortableHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <span className={`font-medium ${stock < 10 ? 'text-red-500' : 'text-foreground'}`}>
          {stock}
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
          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${product.isActive ? 'bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600' : 'bg-red-500/10 text-red-600 hover:bg-green-500/10 hover:text-green-600'}`}
          title="Click to toggle"
        >
          {product.isActive ? "Published" : "Hidden"}
        </button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="flex items-center space-x-2">
          <Link href={`/admin/products/${product.id}`} className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors" title="Edit">
            <Pencil className="w-4 h-4" />
          </Link>
          <Link href={`/admin/products/new?duplicate=${product.id}`} className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors" title="Duplicate">
            <Copy className="w-4 h-4" />
          </Link>
          <button 
            onClick={async () => {
              if (confirm("Are you sure you want to delete this product?")) {
                await deleteProduct(product.id);
              }
            }}
            className="p-2 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];
