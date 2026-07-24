"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Loader2, MapPin, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/shop/orders?limit=50");
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

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    if (!cancelReason) {
      setCancelError("Please select or enter a cancellation reason.");
      return;
    }

    setIsCancelling(true);
    setCancelError("");

    try {
      const res = await fetch(`/api/shop/orders/${cancellingOrder.orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to cancel order");
      }

      // Update state locally
      setOrders((prev) =>
        prev.map((o) =>
          o._id === cancellingOrder._id || o.orderId === cancellingOrder.orderId
            ? { ...o, status: "Cancelled" }
            : o
        )
      );
      setCancellingOrder(null);
      setCancelReason("");
    } catch (err: any) {
      setCancelError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

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
      <h2 className="text-2xl font-playfair font-bold mb-6">Order History</h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Looks like you haven&apos;t made any purchases.</p>
          <Link
            href="/shop"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const canCancel = ["Order Placed", "Confirmed"].includes(order.status);
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
                    {order.estimatedDelivery && (
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
                    <div className="flex gap-2 flex-wrap justify-end">
                      {canCancel && (
                        <button
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelReason("");
                            setCancelError("");
                          }}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-full font-medium transition-colors"
                        >
                          Cancel Order
                        </button>
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

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancellingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 border border-border"
            >
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <XCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold">Cancel Order #{cancellingOrder.orderId}</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to cancel this order? Stock will be restored and your request will be processed immediately.
              </p>

              {cancelError && (
                <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-xl border border-red-200">
                  {cancelError}
                </p>
              )}

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Reason for cancellation</label>
                <select
                  className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-sm"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="">Select a reason</option>
                  <option value="Changed my mind">I changed my mind</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Shipping time is too long">Shipping time is too long</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancellingOrder(null)}
                  disabled={isCancelling}
                  className="flex-1 py-3 px-4 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
