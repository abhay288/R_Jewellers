"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package, Truck, CheckCircle2, MapPin, Clock, RefreshCw, Loader2,
  ShoppingBag, Box, Home, ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

// Map status to icon + colour
const STEP_META: Record<string, { icon: any; color: string; bg: string }> = {
  "Order Placed":     { icon: ShoppingBag, color: "text-blue-600",   bg: "bg-blue-500/10" },
  "Confirmed":        { icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  "Packed":           { icon: Box,          color: "text-amber-600",  bg: "bg-amber-500/10" },
  "Courier Assigned": { icon: Package,      color: "text-orange-600", bg: "bg-orange-500/10" },
  "Shipment Created": { icon: Package,      color: "text-orange-600", bg: "bg-orange-500/10" },
  "Shipped":          { icon: Truck,        color: "text-purple-600", bg: "bg-purple-500/10" },
  "Out For Delivery": { icon: Truck,        color: "text-orange-600", bg: "bg-orange-500/10" },
  "Delivered":        { icon: Home,         color: "text-green-600",  bg: "bg-green-500/10" },
  "Cancelled":        { icon: Package,      color: "text-red-600",    bg: "bg-red-500/10" },
  "Returned":         { icon: RefreshCw,    color: "text-rose-600",   bg: "bg-rose-500/10" },
};

const DEFAULT_META = { icon: Package, color: "text-muted-foreground", bg: "bg-secondary" };

export default function OrderTrackingPage() {
  const params = useParams();
  const trackingId = params.trackingId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/shop/orders/track/${trackingId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Order not found");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (trackingId) fetchTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
        <Package className="w-16 h-16 text-muted-foreground mb-6 opacity-40" />
        <h1 className="text-3xl font-playfair font-bold mb-3">Order Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">{error}</p>
        <Link href="/account/orders" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity">
          View My Orders
        </Link>
      </div>
    );
  }

  const timeline: any[] = data?.trackingTimeline ?? [];
  const reversed = [...timeline].reverse();
  const addr = data?.shippingAddress;
  const currentMeta = STEP_META[data?.status] || DEFAULT_META;
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Back */}
        <Link href="/account/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <h1 className="text-3xl font-playfair font-bold mb-2">Order Tracking</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {data?.type === "return" ? `Return ID: ${data.returnId}` : `Order ID: ${data?.orderId}`}
        </p>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${currentMeta.bg} shrink-0`}>
              <CurrentIcon className={`w-8 h-8 ${currentMeta.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Current Status</p>
              <h2 className="text-2xl font-playfair font-bold">{data?.status}</h2>
              {data?.estimatedDelivery && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Est. Delivery: {new Date(data.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchTracking(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Courier info */}
          {data?.courierName && (
            <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Courier</p>
                <p className="font-medium">{data.courierName}</p>
              </div>
              {data.trackingNumber && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">AWB / Tracking No.</p>
                  <p className="font-mono font-medium">{data.trackingNumber}</p>
                </div>
              )}
              {data.lastTrackingUpdate && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="font-medium">{new Date(data.lastTrackingUpdate).toLocaleString("en-IN")}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Two-column layout: Timeline + Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-playfair font-bold mb-5">Tracking Timeline</h3>

            {reversed.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tracking events yet.</p>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50" />

                <div className="space-y-6">
                  {reversed.map((event: any, idx: number) => {
                    const meta = STEP_META[event.status] || DEFAULT_META;
                    const EventIcon = meta.icon;
                    const isLatest = idx === 0;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-5 relative"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${isLatest ? "border-primary " + meta.bg : "border-border/50 bg-background"}`}>
                          <EventIcon className={`w-4 h-4 ${isLatest ? meta.color : "text-muted-foreground"}`} />
                        </div>
                        <div className={`flex-1 pb-1 ${isLatest ? "" : "opacity-70"}`}>
                          <p className={`font-semibold text-sm ${isLatest ? meta.color : ""}`}>{event.status}</p>
                          {event.note && <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>}
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {new Date(event.date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          {addr && (
            <div>
              <h3 className="text-lg font-playfair font-bold mb-5">Delivery Address</h3>
              <div className="bg-secondary/20 border border-border/50 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold">{addr.fullName}</p>
                    <p className="text-muted-foreground">{addr.houseNo}, {addr.street}</p>
                    {addr.area && <p className="text-muted-foreground">{addr.area}</p>}
                    <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    {addr.phone && <p className="text-muted-foreground mt-2">📞 {addr.phone}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
