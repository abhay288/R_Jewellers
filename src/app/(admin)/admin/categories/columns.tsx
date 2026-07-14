"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { deleteCategory } from "@/backend/actions/category.actions";
import { SortableHeader } from "@/frontend/components/ui/data-table";
import { Checkbox } from "@/frontend/components/ui/checkbox";

export type CategoryColumn = {
  id: string;
  name: string;
  slug: string;
  level: number;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Category Name" />,
    cell: ({ row }) => {
      const level = row.original.level;
      return (
        <div className="font-medium flex items-center" style={{ paddingLeft: `${level * 1.5}rem` }}>
          {level > 0 && <span className="text-muted-foreground mr-2">↳</span>}
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("slug")}</div>,
  },
  {
    accessorKey: "viewCount",
    header: ({ column }) => <SortableHeader column={column} title="Views" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("viewCount")}</div>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {isActive ? "Active" : "Disabled"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Created Date" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="flex items-center space-x-2">
          <Link href={`/admin/categories/${category.id}`} className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="w-4 h-4" />
          </Link>
          <button 
            onClick={async () => {
              if (confirm("Are you sure you want to delete this category?")) {
                await deleteCategory(category.id);
              }
            }}
            className="p-2 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];
