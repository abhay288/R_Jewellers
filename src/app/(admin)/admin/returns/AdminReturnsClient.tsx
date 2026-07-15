"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Eye, RefreshCcw, Download } from 'lucide-react';

export default function AdminReturnsClient() {
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/returns?search=${searchQuery}&status=${statusFilter}`);
      const data = await res.json();
      setReturns(data.returns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Return Requested':
      case 'Under Review':
        return 'text-amber-600 bg-amber-50';
      case 'Approved':
      case 'Pickup Scheduled':
      case 'Picked Up':
      case 'Received':
        return 'text-blue-600 bg-blue-50';
      case 'Quality Check':
      case 'Refund Approved':
        return 'text-purple-600 bg-purple-50';
      case 'Refund Completed':
        return 'text-emerald-600 bg-emerald-50';
      case 'Rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-playfair font-bold">Return Requests</h1>
        <button 
          onClick={fetchReturns}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Return ID or UPI..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:border-primary outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 rounded-xl border border-border bg-background text-sm focus:border-primary outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Return Requested">Return Requested</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Received">Received</option>
              <option value="Quality Check">Quality Check</option>
              <option value="Refund Approved">Refund Approved</option>
              <option value="Refund Completed">Refund Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Return ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Refund Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No returns found matching your criteria.
                  </td>
                </tr>
              ) : (
                returns.map((req) => (
                  <tr key={req._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{req.returnId}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{req.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{req.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{req.order?.orderId}</td>
                    <td className="px-6 py-4 font-bold text-primary">₹{req.totalRefundAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/returns/${req.returnId}`}
                        className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
