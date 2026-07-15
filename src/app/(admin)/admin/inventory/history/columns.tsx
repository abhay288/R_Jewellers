"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Edit2, RotateCcw, AlertTriangle } from "lucide-react";

function getReasonIcon(reason: string) {
  switch (reason) {
    case 'Added': return <ArrowUp className="w-4 h-4 text-green-500 mr-2" />;
    case 'Reduced': return <ArrowDown className="w-4 h-4 text-red-500 mr-2" />;
    case 'Sold': return <ArrowDown className="w-4 h-4 text-blue-500 mr-2" />;
    case 'Returned': return <RotateCcw className="w-4 h-4 text-purple-500 mr-2" />;
    case 'Adjusted': return <Edit2 className="w-4 h-4 text-orange-500 mr-2" />;
    case 'Damaged': return <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />;
    default: return null;
  }
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original.product;
      if (!product) return <span className="text-muted-foreground">Deleted Product</span>;
      return (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;
      return (
        <div className="flex items-center">
          {getReasonIcon(reason)}
          <span>{reason}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "change",
    header: "Change",
    cell: ({ row }) => {
      const change = row.original.changeQuantity;
      const isPositive = change > 0;
      return (
        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change}
        </span>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "New Stock",
    cell: ({ row }) => <div className="font-semibold">{row.original.newStock}</div>,
  },
  {
    accessorKey: "user",
    header: "Updated By",
    cell: ({ row }) => {
      const user = row.original.user;
      return user ? user.name : <span className="text-muted-foreground italic">System</span>;
    }
  }
];
