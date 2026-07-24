"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCcw, Image as ImageIcon, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReturnDetailsClient({ returnId }: { returnId: string }) {
  const [returnReq, setReturnReq] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReturnDetails = async () => {
    try {
      const res = await fetch(`/api/shop/returns/${returnId}`);
      if (!res.ok) throw new Error("Failed to load return details");
      const data = await res.json();
      setReturnReq(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnDetails();
  }, [returnId]);



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

  const pipelineSteps = [
    'Return Requested', 
    'Under Review', 
    'Approved', 
    'Pickup Scheduled', 
    'Picked Up', 
    'Received', 
    'Quality Check', 
    'Refund Approved', 
    'Refund Completed'
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-secondary rounded-xl mb-8" />
        <div className="h-64 bg-secondary/50 rounded-3xl" />
        <div className="h-48 bg-secondary/50 rounded-3xl" />
      </div>
    );
  }

  if (error || !returnReq) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <AlertCircle className="w-5 h-5" />
        <p>{error || "Return request not found."}</p>
      </div>
    );
  }

  const currentStepIndex = pipelineSteps.findIndex(s => s === returnReq.status);
  const isRejected = returnReq.status === 'Rejected';

  // Mask UPI ID
  const maskUpiId = (upi: string) => {
    if (!upi) return '';
    const parts = upi.split('@');
    if (parts.length !== 2) return upi;
    const name = parts[0];
    if (name.length <= 2) return `*@${parts[1]}`;
    return `${name.substring(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}@${parts[1]}`;
  };

  return (
    <div>
      <Link href="/profile/returns" className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Returns
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold">{returnReq.returnId}</h1>
          <p className="text-muted-foreground mt-1">Requested on {new Date(returnReq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <span className={`px-4 py-1.5 text-sm font-bold rounded-full border uppercase tracking-wider ${getStatusColor(returnReq.status)}`}>
          {returnReq.status}
        </span>
      </div>

      {isRejected ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">Return Rejected</h3>
            <p className="text-sm mt-1">Your return request was rejected by the admin team. Please contact support if you have any questions.</p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border p-6 md:p-10 rounded-3xl mb-8 overflow-hidden relative shadow-sm">
          <h3 className="font-semibold mb-8 text-lg">Return Status Pipeline</h3>
          
          {/* Scrollable container for timeline on mobile */}
          <div className="overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 hide-scrollbar">
            <div className="min-w-[800px] relative">
              {/* Background Line */}
              <div className="absolute top-5 left-[5%] right-[5%] h-1 bg-secondary rounded-full" />
              
              {/* Progress Line */}
              <motion.div 
                className="absolute top-5 left-[5%] h-1 bg-primary rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentStepIndex >= 0 ? (currentStepIndex / (pipelineSteps.length - 1)) : 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ width: '90%' }}
              />

              {/* Steps */}
              <div className="relative flex justify-between">
                {pipelineSteps.map((step, index) => {
                  const isCompleted = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;
                  
                  return (
                    <div key={step} className="flex flex-col items-center w-24">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 relative z-10 bg-card transition-colors duration-500
                          ${isCompleted 
                            ? 'border-primary text-primary' 
                            : 'border-border text-muted-foreground'
                          }
                          ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                        `}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-center
                        ${isCompleted ? 'text-primary' : 'text-muted-foreground'}
                      `}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Items */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Returned Items</h3>
            <div className="space-y-6">
              {returnReq.products.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-6">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary/30 rounded-2xl border border-border overflow-hidden shrink-0">
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
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-medium text-lg mb-1">{item.product?.name || 'Unknown Item'}</h4>
                    <p className="text-sm text-muted-foreground mb-3">Qty: {item.quantity}</p>
                    <div className="mt-auto">
                      <p className="text-sm font-medium">Refund Amount</p>
                      <p className="text-xl font-bold text-primary">₹{item.refundAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details & Return Pickup Courier Info */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Reason for Return</h4>
              <p className="font-medium">{returnReq.reason}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</h4>
              <p className="font-medium">{returnReq.notes || 'None provided'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Refund Expected</h4>
              <p className="font-bold text-xl text-primary">₹{returnReq.totalRefundAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">UPI ID for Refund</h4>
              <p className="font-medium">{maskUpiId(returnReq.upiDetails)}</p>
            </div>

            {/* Shiprocket Return Pickup Details */}
            {returnReq.awbNumber && (
              <div className="md:col-span-2 pt-4 border-t border-primary/20 bg-primary/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Shiprocket Reverse Pickup Details</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    Courier: {returnReq.courierName || 'Shiprocket Partner'}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Return AWB: <strong className="text-foreground">{returnReq.awbNumber}</strong>
                  </p>
                </div>
                <Link
                  href={`/orders/${returnReq.awbNumber}`}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Track Return
                </Link>
              </div>
            )}
          </div>

        </div>

        <div className="space-y-8">
          {/* Images */}
          {returnReq.images?.length > 0 && (
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Uploaded Images
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {returnReq.images.map((img: string, idx: number) => (
                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity">
                    <img src={img} alt="Return Evidence" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="bg-secondary/30 border border-border rounded-3xl p-6">
            <h3 className="font-semibold text-lg mb-4">Original Order</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <Link href={`/profile/orders/${returnReq.order?.orderId}`} className="text-sm font-medium hover:text-primary transition-colors">
                  {returnReq.order?.orderId}
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order Total</span>
                <span className="text-sm font-bold">₹{returnReq.order?.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
