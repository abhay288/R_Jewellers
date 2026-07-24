"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Loader2, MapPin, RotateCcw } from "lucide-react";
import CancelOrderModal from "@/app/(shop)/profile/orders/CancelOrderModal";
import ReturnOrderModal from "@/app/(shop)/profile/returns/ReturnOrderModal";

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

  // Return modal state
  const [returnOrder, setReturnOrder] = useState<any | null>(null);

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
            const canReturn = order.status === "Delivered";

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
                          onClick={() => setCancellingOrder(order)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-full font-medium transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      {canReturn && (
                        <button
                          onClick={() => setReturnOrder(order)}
                          className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-full font-medium transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Request Return
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
    </div>
  );
}
