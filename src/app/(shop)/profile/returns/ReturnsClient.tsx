"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, AlertCircle, RefreshCcw } from 'lucide-react';

export default function ReturnsClient() {
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await fetch('/api/shop/returns');
      if (!res.ok) throw new Error("Failed to load returns");
      const data = await res.json();
      setReturns(data.returns);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Return Requested':
      case 'Under Review':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Approved':
      case 'Pickup Scheduled':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Refund Completed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-primary bg-primary/5 border-primary/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <h1 className="text-3xl font-playfair font-bold">My Returns</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-secondary/50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-playfair font-bold text-foreground">My Returns</h1>
        <button onClick={fetchReturns} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-playfair font-bold mb-2">No Returns Yet</h2>
          <p className="text-muted-foreground mb-8">You haven't submitted any return requests.</p>
          <Link 
            href="/profile/orders"
            className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            View Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map((req) => (
            <Link 
              key={req.returnId}
              href={`/profile/returns/${req.returnId}`}
              className="block bg-card border border-border rounded-3xl p-6 hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pr-12">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{req.returnId}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Order ID: {req.order?.orderId}</p>
                </div>
                
                <div className="text-left md:text-right">
                  <p className="text-sm font-medium">Refund Amount</p>
                  <p className="text-xl font-bold text-primary">₹{req.totalRefundAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                {req.products.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-secondary/30 pr-4 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-background border border-border overflow-hidden">
                      <img 
                        src={item.product?.images?.[0]?.url || item.product?.images?.[0] || (
                          item.product?.name?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" :
                          item.product?.name?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" :
                          item.product?.name?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" :
                          item.product?.name?.toLowerCase().includes('bangle') || item.product?.name?.toLowerCase().includes('bracelet') ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" :
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                        )} 
                        alt={item.product?.name || 'Returned product'} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1 max-w-[150px]">{item.product?.name || 'Unknown Item'}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
