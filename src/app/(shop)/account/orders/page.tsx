"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Loader2, MapPin } from "lucide-react";

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

  useEffect(() => {
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
    fetchOrders();
  }, []);

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
          {orders.map((order) => (
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
                  {order.courierName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Courier: {order.courierName}
                      {order.awbNumber && <span className="ml-2 font-mono">AWB: {order.awbNumber}</span>}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                  <span className="font-bold text-lg text-primary">₹{order.totalAmount?.toFixed(2)}</span>
                  <div className="flex gap-2">
                    {order.awbNumber && (
                      <Link
                        href={`/orders/${order.awbNumber}`}
                        className="text-sm text-primary font-medium hover:underline flex items-center gap-1 border border-primary/30 px-3 py-1.5 rounded-full"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Track
                      </Link>
                    )}
                    <Link
                      href={`/account/orders/${order.orderId}`}
                      className="text-sm text-primary font-medium hover:underline flex items-center"
                    >
                      Details <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {order.products?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-3 shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-secondary overflow-hidden shrink-0 relative">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
