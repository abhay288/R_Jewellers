"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Loader2, MapPin, RotateCcw, Star, Calendar, Filter, X } from "lucide-react";
import CancelOrderModal from "@/app/(shop)/profile/orders/CancelOrderModal";
import ReturnOrderModal from "@/app/(shop)/profile/returns/ReturnOrderModal";
import OrderReviewModal from "@/app/(shop)/profile/orders/OrderReviewModal";

const STATUS_COLORS: Record<string, string> = {
  "Order Placed":      "bg-blue-500/10 text-blue-600",
  "Confirmed":         "bg-indigo-500/10 text-indigo-600",
  "Packed":            "bg-amber-500/10 text-amber-600",
  "Shipped":           "bg-purple-500/10 text-purple-600",
  "Out For Delivery":  "bg-orange-500/10 text-orange-600",
  "Delivered":         "bg-green-500/10 text-green-600",
  "Cancelled":         "bg-red-500/10 text-red-600",
  "Returned":          "bg-rose-500/10 text-rose-600",
};

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

const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month & Year Filter States
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Cancellation modal state
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);

  // Return modal state
  const [returnOrder, setReturnOrder] = useState<any | null>(null);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/shop/orders?limit=100");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelSuccess = (updatedOrder: any) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id || o.orderId === updatedOrder.orderId ? updatedOrder : o))
    );
    setCancellingOrder(null);
  };

  const handleReturnSuccess = () => {
    fetchOrders();
    setReturnOrder(null);
  };

  // Available years in dataset
  const availableYears = Array.from(
    new Set(orders.map((o) => new Date(o.createdAt).getFullYear()))
  ).sort((a, b) => b - a);

  // Filter orders by year, month, status
  const filteredOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const matchesYear = selectedYear === "all" || d.getFullYear().toString() === selectedYear;
    const matchesMonth = selectedMonth === "all" || d.getMonth().toString() === selectedMonth;
    const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;
    return matchesYear && matchesMonth && matchesStatus;
  });

  const isFiltered = selectedYear !== "all" || selectedMonth !== "all" || selectedStatus !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        <p>Failed to load orders: {error}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-playfair font-bold">Order History</h2>
        
        {/* Month, Year & Status Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-secondary/40 border border-border/50 p-2.5 rounded-2xl">
          <div className="flex items-center text-xs font-semibold text-muted-foreground pl-2 gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Year Filter Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>{yr}</option>
            ))}
          </select>

          {/* Month Filter Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Months</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-background border border-border/50 rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
                setSelectedStatus("all");
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1 pl-1 font-semibold"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-secondary/20 rounded-3xl border border-border/40">
          <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">No orders found</h3>
          <p className="text-muted-foreground text-xs mb-6">
            {isFiltered ? "No orders match your selected month, year, or status filter." : "Looks like you haven't made any purchases yet."}
          </p>
          {isFiltered ? (
            <button
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
                setSelectedStatus("all");
              }}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/shop"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === "Delivered";
            const canCancel = ["Order Placed", "Confirmed"].includes(order.status);

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
              <div
                key={order._id}
                className="border border-border/50 rounded-2xl p-6 bg-background/50 hover:border-primary/50 transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-5 pb-5 border-b border-border/50 gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-1 flex-wrap gap-2">
                      <span className="font-bold tracking-tight">{order.orderId}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[order.status] || "bg-secondary text-muted-foreground"}`}>
                        {order.status}
                      </span>
                      {order.paymentStatus === "paid" && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-500/10 text-green-600">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    {order.estimatedDelivery && !isDelivered && (
                      <p className="text-sm text-green-600 font-medium mt-0.5">
                        Expected Delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                      </p>
                    )}
                    {order.courierName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.courierName}
                        {order.awbNumber && <span className="ml-2 font-mono opacity-70">{order.awbNumber}</span>}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <span className="font-bold text-lg text-primary">₹{order.totalAmount?.toFixed(2)}</span>
                    <div className="flex gap-2 flex-wrap justify-end items-center">
                      
                      {/* Cancel Button */}
                      {canCancel && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-full font-medium transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Post-Delivery Product Rating & Review Button */}
                      {isDelivered && (
                        <button
                          onClick={() => setReviewOrder(order)}
                          className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full font-semibold transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          Rate & Review
                        </button>
                      )}

                      {/* Return Button (Active within 48 hours / Dismissed after 2 days) */}
                      {isReturnWindowActive && (
                        <button
                          onClick={() => setReturnOrder(order)}
                          className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-full font-medium transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Request Return
                        </button>
                      )}

                      {/* Dismissed Return Badge when 48h expired */}
                      {isReturnWindowExpired && (
                        <span className="text-[11px] text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-full border border-border/50 font-medium">
                          Return window closed (48h expired)
                        </span>
                      )}

                      <Link
                        href={`/orders/${order.awbNumber || order.orderId}`}
                        className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Track Order
                      </Link>
                      <Link
                        href={`/account/orders/${order.orderId}`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border/50 px-4 py-2 rounded-full transition-colors"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                  {order.products?.map((item: any, idx: number) => {
                    const imgUrl = item.image || item.product?.images?.[0] || item.product?.image;

                    return (
                      <div key={idx} className="flex items-center space-x-3 shrink-0">
                        <div className="w-14 h-14 rounded-xl bg-secondary overflow-hidden shrink-0 relative">
                          {imgUrl ? (
                            <Image src={imgUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1 max-w-36">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-xs text-primary font-medium">₹{item.finalPrice}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Questionnaire Modal */}
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

      {/* Product Rating & Feedback Review Modal */}
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
