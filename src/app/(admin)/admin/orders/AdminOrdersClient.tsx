"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Eye, ChevronRight, Download } from 'lucide-react';
import { generateInvoicePDF } from '@/frontend/lib/InvoiceGenerator';

export default function AdminOrdersClient({ initialOrders, totalPages, currentPage, currentStatus, currentSearch }: any) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [statusFilter, setStatusFilter] = useState(currentStatus);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/orders?search=${search}&status=${statusFilter}&page=1`);
  };

  const handleFilterChange = (e: any) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    router.push(`/admin/orders?search=${search}&status=${newStatus}&page=1`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Out For Delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Payment Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Top Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="All">All Active Orders</option>
            <option value="Order Placed">Order Placed (COD)</option>
            <option value="Confirmed">Confirmed (Paid)</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
            <option value="Payment Pending">Payment Pending (Unpaid Online)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {initialOrders.map((order: any) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{order.orderId}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {(() => {
                    const addr = (typeof order.shippingAddress === 'object' && order.shippingAddress && (order.shippingAddress.fullName || order.shippingAddress.street))
                      ? order.shippingAddress 
                      : (order.shippingAddressSnapshot || null);
                    const name = order.user?.name || addr?.fullName || 'Guest';
                    const email = order.user?.email || addr?.email || '';

                    return (
                      <>
                        <div className="font-medium text-gray-900">{name}</div>
                        <div className="text-gray-500 text-xs">{email}</div>
                      </>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">₹{order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs rounded-full border font-medium ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => generateInvoicePDF(order)} className="text-gray-500 hover:text-black inline-flex items-center">
                    <Download className="w-4 h-4" />
                  </button>
                  <Link href={`/admin/orders/${order.orderId}`} className="text-gray-500 hover:text-black inline-flex items-center">
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {initialOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing Page {currentPage} of {totalPages}
          </span>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => router.push(`/admin/orders?search=${search}&status=${statusFilter}&page=${idx + 1}`)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                  currentPage === idx + 1 ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
