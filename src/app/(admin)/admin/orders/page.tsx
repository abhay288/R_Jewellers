"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Eye, Truck } from "lucide-react";

const initialOrders = [
  { id: "ORD-001", customer: "John Doe", email: "john@example.com", date: "Jul 09, 2026", amount: "₹1,200", status: "Completed", items: 2 },
  { id: "ORD-002", customer: "Jane Smith", email: "jane@example.com", date: "Jul 08, 2026", amount: "₹850", status: "Processing", items: 1 },
  { id: "ORD-003", customer: "Alice Johnson", email: "alice@example.com", date: "Jul 07, 2026", amount: "₹450", status: "Pending", items: 1 },
  { id: "ORD-004", customer: "Bob Williams", email: "bob@example.com", date: "Jul 05, 2026", amount: "₹200", status: "Completed", items: 3 },
  { id: "ORD-005", customer: "Radhika Sharma", email: "radhika@example.com", date: "Jul 02, 2026", amount: "₹1,048", status: "Shipped", items: 2 },
];

export default function AdminOrdersPage() {
  const [orders] = useState(initialOrders);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage customer orders.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex w-full md:w-auto items-center bg-secondary/50 rounded-lg px-4 py-2 border border-border/50 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search by order ID or name..." 
            className="bg-transparent border-none outline-none text-sm w-full md:w-64"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 border border-border/50 px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <select className="flex-1 md:flex-none border border-border/50 bg-transparent px-4 py-2 rounded-lg text-sm font-medium outline-none focus:border-primary transition-colors cursor-pointer">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Items</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-sm font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="p-4">
                    <span className="font-medium text-sm text-primary">{order.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{order.customer}</span>
                      <span className="text-xs text-muted-foreground">{order.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.items} items</td>
                  <td className="p-4 text-sm font-medium">{order.amount}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wider ${
                      order.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                      order.status === 'Processing' ? 'bg-blue-500/10 text-blue-600' :
                      order.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-primary transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-primary transition-colors" title="Update Shipping">
                        <Truck className="w-4 h-4" />
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
