export const dynamic = 'force-dynamic';

import { getInventoryDashboardStats } from "@/backend/actions/inventory.actions";
import { Package, AlertTriangle, XCircle, IndianRupee, Activity } from "lucide-react";
import Link from "next/link";

export default async function InventoryDashboard() {
  const statsRes = await getInventoryDashboardStats();
  const stats = statsRes.success ? statsRes.data : {
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    availableStock: 0,
    inventoryValue: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Inventory Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your stock levels and inventory health.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            href="/admin/inventory/history" 
            className="inline-flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Activity className="w-4 h-4 mr-2" />
            Inventory History
          </Link>
          <Link 
            href="/admin/products" 
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-primary/20"
          >
            <Package className="w-4 h-4 mr-2" />
            Manage Products
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <h3 className="text-3xl font-bold mt-2">{stats?.totalProducts}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
              <h3 className="text-3xl font-bold mt-2 text-yellow-600">{stats?.lowStock}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              <h3 className="text-3xl font-bold mt-2 text-red-600">{stats?.outOfStock}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Est. Inventory Value</p>
              <h3 className="text-3xl font-bold mt-2">
                ₹{stats?.inventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional widgets could go here, e.g. Recent Low Stock items table */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-playfair font-semibold mb-4">Inventory Overview</h3>
        <p className="text-muted-foreground text-sm">
          Currently tracking {stats?.availableStock} total units across {stats?.totalProducts} product catalogs.
        </p>
        <div className="mt-8 flex justify-center py-12 border border-dashed rounded-xl border-border">
          <div className="text-center">
             <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
             <p className="text-muted-foreground">Select 'Inventory History' or 'Manage Products' to dive deeper.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
