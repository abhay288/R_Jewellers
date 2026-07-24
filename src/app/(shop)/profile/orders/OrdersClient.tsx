"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Filter, RotateCcw, Star, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';
import CancelOrderModal from './CancelOrderModal';
import ReturnOrderModal from '../returns/ReturnOrderModal';
import OrderReviewModal from './OrderReviewModal';

const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

const MONTHS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

export default function OrdersClient({ initialOrders, totalPages, currentPage, currentStatus }: any) {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState(currentStatus);

  // Month & Year Filter States
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Cancel order modal state
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);

  // Return order modal state
  const [returnOrder, setReturnOrder] = useState<any | null>(null);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);

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

  // Available years in dataset
  const availableYears = Array.from(
    new Set(orders.map((o) => new Date(o.createdAt).getFullYear()))
  ).sort((a, b) => b - a);

  // Filter orders by year, month
  const filteredOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const matchesYear = selectedYear === "all" || d.getFullYear().toString() === selectedYear;
    const matchesMonth = selectedMonth === "all" || d.getMonth().toString() === selectedMonth;
    return matchesYear && matchesMonth;
  });

  const isFiltered = selectedYear !== "all" || selectedMonth !== "all";

  return (
    <div>
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-secondary/30 p-4 rounded-2xl border border-border/50">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center text-xs font-semibold text-muted-foreground gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>

          <select 
            className="px-3 py-1.5 bg-background border border-border/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="All">All Statuses</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Month & Year Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center text-xs font-semibold text-muted-foreground gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date:</span>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>{yr}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Months</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {isFiltered && (
            <button
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Reset Date
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-6">
            {isFiltered ? "No orders match your selected month or year filter." : "You haven't placed any orders with this status yet."}
          </p>
          {isFiltered ? (
            <button
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
              }}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Clear Date Filters
            </button>
          ) : (
            <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: any, idx: number) => {
            const isDelivered = order.status === 'Delivered';
            const canCancel = ['Order Placed', 'Confirmed'].includes(order.status);

            // 48 Hours Return Window calculation
            let deliveryTime = 0;
            if (order.deliveredAt) {
              deliveryTime = new Date(order.deliveredAt).getTime();
            } else if (order.returnEligibilityDate) {
              deliveryTime = new Date(order.returnEligibilityDate).getTime() - TWO_DAYS_MS;
            } else if (isDelivered) {
              deliveryTime = new Date(order.updatedAt).getTime();
            }

            const now = Date.now();
            const timeSinceDelivery = deliveryTime ? now - deliveryTime : 0;
            const isReturnWindowActive = isDelivered && deliveryTime > 0 && timeSinceDelivery <= TWO_DAYS_MS;
            const isReturnWindowExpired = isDelivered && deliveryTime > 0 && timeSinceDelivery > TWO_DAYS_MS;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
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
                    {isDelivered && (
                      <button
                        onClick={() => setReviewOrder(order)}
                        className="w-full lg:w-auto flex items-center justify-center px-5 py-2.5 border border-amber-500/30 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 rounded-full transition-colors text-sm font-semibold"
                      >
                        <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-500 text-amber-500" />
                        Rate & Review
                      </button>
                    )}
                    {isReturnWindowActive && (
                      <button
                        onClick={() => setReturnOrder(order)}
                        className="w-full lg:w-auto flex items-center justify-center px-5 py-2.5 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors text-sm font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Request Return
                      </button>
                    )}
                    {isReturnWindowExpired && (
                      <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border/50 font-medium">
                        Return window closed (48h expired)
                      </span>
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

      {/* Product Rating & Review Modal */}
      {reviewOrder && (
        <OrderReviewModal
          isOpen={!!reviewOrder}
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
        />
      )}
    </div>
  );
}
