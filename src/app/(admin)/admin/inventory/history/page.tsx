import { getInventoryHistory } from "@/backend/actions/inventory.actions";
import { ArrowLeft, ArrowDown, ArrowUp, Edit2, RotateCcw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/frontend/components/ui/data-table";

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

export default async function InventoryHistoryPage() {
  const historyRes = await getInventoryHistory(1, 100); // Fetching top 100 for simplicity without pagination params for now
  
  const historyData = historyRes.success ? historyRes.data : [];

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => <div className="font-semibold">{row.original.newStock}</div>,
    },
    {
      accessorKey: "user",
      header: "Updated By",
      cell: ({ row }: any) => {
        const user = row.original.user;
        return user ? user.name : <span className="text-muted-foreground italic">System</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/admin/inventory" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Inventory History</h1>
          <p className="text-muted-foreground mt-1">Audit log of all stock changes and adjustments.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={historyData} 
        searchKey="product" 
        searchPlaceholder="Filter history..."
      />
    </div>
  );
}
