"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle2, Package, Truck, Home, MapPin, XCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoicePDF } from '@/frontend/lib/InvoiceGenerator';

import ReturnOrderModal from '../../returns/ReturnOrderModal';
import CancelOrderModal from '../CancelOrderModal';
import OrderReviewModal from '../OrderReviewModal';

export default function OrderDetailsClient({ initialOrder }: { initialOrder: any }) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');
  const [returnCountdown, setReturnCountdown] = useState<string | null>(null);

  const canCancel = ['Order Placed', 'Confirmed'].includes(order.status);
  const isDelivered = order.status === 'Delivered';
  
  // 48 Hours Return Window calculation
  const TWO_DAYS_MS = 48 * 60 * 60 * 1000;
  let deliveryTime = 0;
  if (order.deliveredAt) {
    deliveryTime = new Date(order.deliveredAt).getTime();
  } else if (order.returnEligibilityDate) {
    deliveryTime = new Date(order.returnEligibilityDate).getTime() - TWO_DAYS_MS;
  } else if (isDelivered) {
    deliveryTime = new Date(order.updatedAt).getTime();
  }

  const nowTime = Date.now();
  const timeSinceDelivery = deliveryTime ? nowTime - deliveryTime : 0;
  const canReturn = isDelivered && deliveryTime > 0 && timeSinceDelivery <= TWO_DAYS_MS;
  const isReturnExpired = isDelivered && deliveryTime > 0 && timeSinceDelivery > TWO_DAYS_MS;

  const returnExpiryTime = deliveryTime ? deliveryTime + TWO_DAYS_MS : 0;

  // Countdown timer effect
  useState(() => {
    if (canReturn && returnExpiryTime) {
      const interval = setInterval(() => {
        const diff = returnExpiryTime - Date.now();
        if (diff <= 0) {
          setReturnCountdown(null);
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setReturnCountdown(`${hours}h ${mins}m remaining`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    setIsCancelling(true);
    setError('');

    try {
      const res = await fetch(`/api/shop/orders/${order.orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel order');
      }

      const updatedOrder = await res.json();
      setOrder({ ...order, ...updatedOrder });
      setIsCancelModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = () => {
    generateInvoicePDF(order);
  };

  const timelineSteps = [
    { label: 'Order Placed', icon: Package },
    { label: 'Confirmed', icon: CheckCircle2 },
    { label: 'Packed', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'Out For Delivery', icon: Truck },
    { label: 'Delivered', icon: Home },
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.label === order.status);
  const isCancelled = order.status === 'Cancelled';
  
  return (
    <div>
      <Link href="/profile/orders" className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Order {order.orderId}</h1>
          <p className="text-muted-foreground mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {canCancel && (
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-2.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-full text-sm font-medium transition-colors"
            >
              Cancel Order
            </button>
          )}
          {isDelivered && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 border border-amber-500/30 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 rounded-full text-sm font-semibold transition-colors"
            >
              <Star className="w-4 h-4 mr-2 fill-amber-500 text-amber-500" />
              Rate & Review
            </button>
          )}
          {canReturn && (
            <button 
              onClick={() => setIsReturnModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-2.5 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full text-sm font-medium transition-colors"
            >
              Return Order
            </button>
          )}
          {isReturnExpired && (
            <span className="text-xs text-muted-foreground bg-secondary px-4 py-2 rounded-full border border-border/50 font-medium">
              Return window closed (48h expired)
            </span>
          )}
          <button 
            onClick={handleDownloadInvoice}
            className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4 mr-2" />
            Invoice
          </button>
          {order.trackingNumber && (
            <Link 
              href={`/orders/track/${order.trackingNumber}`}
              className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Truck className="w-4 h-4 mr-2" />
              Track Shipment
            </Link>
          )}
        </div>
      </div>

      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl mb-8 flex items-start gap-4">
          <XCircle className="w-6 h-6 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">Order Cancelled</h3>
            <p className="text-sm mt-1">This order was cancelled. Reason: {order.trackingTimeline[order.trackingTimeline.length - 1]?.note}</p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border p-6 md:p-10 rounded-3xl mb-8 overflow-hidden relative shadow-sm">
          <h3 className="font-semibold mb-8 text-lg">Tracking Status</h3>
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-secondary rounded-full" />
            
            {/* Active Progress Line */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(Math.max(0, currentStepIndex) / (timelineSteps.length - 1)) * 80 + 10}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute top-5 left-0 h-1 bg-primary rounded-full z-0"
            />
            
            <div className="relative z-10 flex justify-between">
              {timelineSteps.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                const Icon = step.icon;
                
                const historyMatch = order.trackingTimeline.find((t: any) => t.status === step.label);

                return (
                  <div key={idx} className="flex flex-col items-center w-24 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.2 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-500
                        ${isCompleted ? 'bg-primary text-primary-foreground shadow-md' : 'bg-background border-2 border-secondary text-muted-foreground'}`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <span className={`text-xs font-medium mb-1 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    {historyMatch && (
                      <span className="text-[10px] text-muted-foreground hidden sm:block">
                        {new Date(historyMatch.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {order.awbNumber && (
            <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Courier Partner:</span> {order.courierName || 'Blue Dart'}
              </div>
              <div>
                <span className="font-semibold text-foreground">AWB (Tracking No):</span> <span className="font-mono">{order.awbNumber}</span>
              </div>
              {order.estimatedDelivery && (
                <div>
                  <span className="font-semibold text-foreground">Estimated Delivery:</span> {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {order.shipmentStatus && (
                <div>
                  <span className="font-semibold text-foreground">Courier Status:</span> <span className="text-primary font-medium">{order.shipmentStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Items Ordered</h3>
            <div className="divide-y divide-border">
              {order.products.map((item: any, idx: number) => {
                const imageUrl = item.image || (item.product && typeof item.product === 'object' && (
                  Array.isArray(item.product.images) && item.product.images.length > 0 
                    ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0]?.url)
                    : item.product.image
                )) || (
                  item.name?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" :
                  item.name?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" :
                  item.name?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" :
                  item.name?.toLowerCase().includes('bangle') || item.name?.toLowerCase().includes('bracelet') ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" :
                  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                );

                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="w-20 h-20 bg-secondary rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="font-semibold">₹{item.finalPrice}</span>
                        {item.discount > 0 && <span className="text-xs text-green-600">Saved ₹{item.discount}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-lg mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" /> Delivery Address
            </h3>
            {(() => {
              const addr = (typeof order.shippingAddress === 'object' && order.shippingAddress && (order.shippingAddress.fullName || order.shippingAddress.street))
                ? order.shippingAddress 
                : (order.shippingAddressSnapshot || null);

              return addr && (addr.fullName || addr.street || addr.city || addr.phone) ? (
                <div className="text-sm space-y-1 text-muted-foreground">
                  {addr.fullName && <p className="font-medium text-foreground text-base mb-2">{addr.fullName}</p>}
                  {(addr.houseNo || addr.street) && (
                    <p>{[addr.houseNo, addr.street].filter(Boolean).join(', ')}</p>
                  )}
                  {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                  {(addr.area || addr.city || addr.state || addr.postalCode) && (
                    <p>{[addr.area, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</p>
                  )}
                  {addr.phone && (
                    <p className="mt-3 text-foreground font-medium flex items-center">
                      Phone: {addr.phone}
                      {(addr.alternatePhone || addr.alternateMobile) && `, ${addr.alternatePhone || addr.alternateMobile}`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Address details not available.</p>
              );
            })()}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-border/50">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.totalAmount + order.discount - order.deliveryCharges}</span>
                </div>
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{order.deliveryCharges === 0 ? 'FREE' : `₹${order.deliveryCharges}`}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-border font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <CancelOrderModal
          order={order}
          onClose={() => setIsCancelModalOpen(false)}
          onSuccess={(updatedOrder) => {
            setOrder(updatedOrder);
            setIsCancelModalOpen(false);
          }}
        />
      )}

      <ReturnOrderModal 
        isOpen={isReturnModalOpen} 
        onClose={() => setIsReturnModalOpen(false)} 
        order={order}
        onSuccess={() => {
          setIsReturnModalOpen(false);
          router.push('/profile/returns');
        }}
      />

      <OrderReviewModal
        isOpen={isReviewModalOpen}
        order={order}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
