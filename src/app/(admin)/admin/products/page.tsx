"use client";

import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react";

// Mock Products Data
const initialProducts = [
  { id: "PRD-001", name: "Royal Kundan Bridal Choker Set", category: "Bridal", price: "$899.00", stock: 15, status: "Active" },
  { id: "PRD-002", name: "Rose Gold Diamond Bangles", category: "Everyday", price: "$350.00", stock: 42, status: "Active" },
  { id: "PRD-003", name: "Classic Diamond Tennis Bracelet", category: "Everyday", price: "$499.00", stock: 0, status: "Out of Stock" },
  { id: "PRD-004", name: "Emerald Drop Earrings", category: "Festive", price: "$299.00", stock: 8, status: "Active" },
  { id: "PRD-005", name: "Temple Jewellery Gold Necklace", category: "Festive", price: "$750.00", stock: 3, status: "Low Stock" },
];

export default function AdminProductsPage() {
  const [products] = useState(initialProducts);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory and product listings.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex w-full md:w-auto items-center bg-secondary/50 rounded-lg px-4 py-2 border border-border/50 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="bg-transparent border-none outline-none text-sm w-full md:w-64"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 border border-border/50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <select className="flex-1 md:flex-none border border-border/50 bg-transparent px-4 py-2 rounded-lg text-sm font-medium outline-none focus:border-primary transition-colors cursor-pointer">
            <option>All Categories</option>
            <option>Bridal</option>
            <option>Everyday</option>
            <option>Festive</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="p-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-sm font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-[8px] uppercase text-muted-foreground">Img</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                  <td className="p-4 text-sm font-medium">{product.price}</td>
                  <td className="p-4 text-sm">{product.stock}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wider ${
                      product.status === 'Active' ? 'bg-green-500/10 text-green-600' :
                      product.status === 'Out of Stock' ? 'bg-red-500/10 text-red-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 to 5 of 5 entries</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-border/50 rounded-md hover:bg-secondary transition-colors disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md">1</button>
            <button className="px-3 py-1 border border-border/50 rounded-md hover:bg-secondary transition-colors disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
