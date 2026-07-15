import { getInventoryHistory } from "@/backend/actions/inventory.actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/frontend/components/ui/data-table";
import { columns } from "./columns";

export default async function InventoryHistoryPage() {
  const historyRes = await getInventoryHistory(1, 100); // Fetching top 100 for simplicity without pagination params for now
  
  const historyData = historyRes.success ? historyRes.data : [];

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
