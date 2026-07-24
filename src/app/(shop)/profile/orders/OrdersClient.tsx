"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Filter, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import CancelOrderModal from './CancelOrderModal';
import ReturnOrderModal from '../returns/ReturnOrderModal';

export default function OrdersClient({ initialOrders, totalPages, currentPage, currentStatus }: any) {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState(currentStatus);

  // Cancel order modal state
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);

  // Return order modal state
  const [returnOrder, setReturnOrder] = useState<any | null>(null);

  const handleFilterChange = (e: any) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    router.push(`/profile/orders?status=${newStatus}&page=1`);
  };

  const handleCancelSuccess = (updatedOrder: any) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id || o.orderId === updatedOrder.orderId ? updatedOrder : o))
    );
    setCancellingOrder(null);
  };

  const handleReturnSuccess = () => {
    router.refresh();
    setReturnOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'Shipped':
      case 'Out For Delivery': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select 
            className="w-full sm:w-auto pl-10 pr-8 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="All">All Orders</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-6">You haven't placed any orders with this status yet.</p>
          <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any, idx: number) => {
            const canCancel = ['Order Placed', 'Confirmed'].includes(order.status);
            const canReturn = order.status === 'Delivered';

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={order._id} 
                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="font-semibold text-lg">{order.orderId}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                      <div>
                        <p className="text-muted-foreground">Order Date</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-bold text-primary">₹{order.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        <p className="font-medium">{order.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="flex -space-x-4">
                      {order.products.slice(0, 4).map((p: any, i: number) => {
                        const imageUrl = p.image || (p.product && typeof p.product === 'object' && (
                          Array.isArray(p.product.images) && p.product.images.length > 0 
                            ? (typeof p.product.images[0] === 'string' ? p.product.images[0] : p.product.images[0]?.url)
                            : p.product.image
                        )) || (
                          p.name?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" :
                          p.name?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" :
                          p.name?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" :
                          p.name?.toLowerCase().includes('bangle') || p.name?.toLowerCase().includes('bracelet') ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" :
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                        );

                        return (
                          <div key={i} className="w-12 h-12 rounded-full border-2 border-background overflow-hidden bg-secondary relative">
                            <img 
                              src={imageUrl} 
                              alt={p.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        );
                      })}
                      {order.products.length > 4 && (
                        <div className="w-12 h-12 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium relative z-10">
                          +{order.products.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row lg:flex-col items-center lg:items-end justify-center gap-3 lg:border-l lg:border-border lg:pl-6">
                    {canCancel && (
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="w-full lg:w-auto px-5 py-2.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    )}
                    {canReturn && (
                      <button
                        onClick={() => setReturnOrder(order)}
                        className="w-full lg:w-auto flex items-center justify-center px-5 py-2.5 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors text-sm font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Request Return
                      </button>
                    )}
                    <Link 
                      href={`/profile/orders/${order.orderId}`}
                      className="w-full lg:w-auto flex items-center justify-center px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors text-sm font-medium"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => router.push(`/profile/orders?status=${statusFilter}&page=${idx + 1}`)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentPage === idx + 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Cancel Order 3-Step Questionnaire Modal */}
      {cancellingOrder && (
        <CancelOrderModal
          order={cancellingOrder}
          onClose={() => setCancellingOrder(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Return Delivered Order Modal with Product Images */}
      {returnOrder && (
        <ReturnOrderModal
          isOpen={!!returnOrder}
          order={returnOrder}
          onClose={() => setReturnOrder(null)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}
