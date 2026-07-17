"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Package, Box, RefreshCcw, DollarSign, Image as ImageIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminReturnDetailsClient({ returnId }: { returnId: string }) {
  const [returnReq, setReturnReq] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status Update state
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // QC State
  const [qcItems, setQcItems] = useState<{ productId: string, condition: 'Good' | 'Damaged', reason?: string }[]>([]);
  
  // Refund State
  const [transactionRef, setTransactionRef] = useState('');

  useEffect(() => {
    fetchReturnDetails();
  }, [returnId]);

  const fetchReturnDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shop/returns/${returnId}`); // Can reuse customer endpoint if auth allows, or wait, customer endpoint checks `user: session.user.id`. Let's assume Admin also has access, but wait. `getReturnById` uses `userId?` conditionally. Let's see `api/shop/returns/[id]`. It forces `session.user.id`. So Admin needs their own endpoint or we bypass it.
      // Ah! In `api/shop/returns/[id]/route.ts` I passed `session.user.id`. Admins might get 404.
      // Wait, let's create a dedicated GET in `api/admin/returns/[id]/route.ts` or just fetch via the service directly in a new API route.
      // Actually, I didn't create `api/admin/returns/[id]/route.ts`. Let's do that right after this.
      const adminRes = await fetch(`/api/admin/returns/${returnId}`);
      if (!adminRes.ok) throw new Error("Failed to load return details");
      const data = await adminRes.json();
      setReturnReq(data);
      setNewStatus(data.status);

      // Initialize QC Items
      if (data.status === 'Received') {
        const initialQc = data.products.map((p: any) => ({
          productId: p.product._id,
          condition: 'Good',
          reason: ''
        }));
        setQcItems(initialQc);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/returns/${returnId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: adminNotes })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess(`Status updated to ${newStatus}`);
      setAdminNotes('');
      fetchReturnDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQualityCheck = async () => {
    setIsUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/returns/${returnId}/quality-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsQC: qcItems })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess("Quality Check completed successfully. Inventory updated.");
      fetchReturnDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!transactionRef) {
      setError("Please provide the UPI Transaction Reference.");
      return;
    }
    setIsUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/returns/${returnId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionReference: transactionRef })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess("Refund processed successfully.");
      fetchReturnDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleReturnPickup = async () => {
    setIsUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/returns/${returnId}/pickup`, {
        method: 'POST'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule return pickup');
      }
      const data = await res.json();
      setSuccess(`Return pickup scheduled successfully! AWB: ${data.awbNumber} via ${data.courierName}`);
      fetchReturnDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading return details...</div>;
  }

  if (error && !returnReq) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  const validTransitions: any = {
    'Return Requested': ['Under Review', 'Rejected'],
    'Under Review': ['Approved', 'Rejected'],
    'Approved': ['Pickup Scheduled'],
    'Pickup Scheduled': ['Picked Up'],
    'Picked Up': ['Received'],
    'Received': ['Quality Check'],
    'Quality Check': ['Refund Approved', 'Rejected'],
    'Refund Approved': ['Refund Completed'],
    'Refund Completed': [],
    'Rejected': []
  };

  const allowedStatuses = validTransitions[returnReq.status] || [];

  return (
    <div className="space-y-6">
      <Link href="/admin/returns" className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Returns
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold">Return {returnReq.returnId}</h1>
          <p className="text-muted-foreground mt-1">Requested on {new Date(returnReq.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span className="px-4 py-2 bg-secondary rounded-full font-bold uppercase tracking-wider text-sm border border-border">
          {returnReq.status}
        </span>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Center */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
              Action Center
            </h3>

            {/* Standard Status Update */}
            {returnReq.status !== 'Received' && returnReq.status !== 'Quality Check' && returnReq.status !== 'Refund Approved' && allowedStatuses.length > 0 && (
              returnReq.status === 'Approved' ? (
                <div className="space-y-4 border border-amber-200 bg-amber-500/5 p-5 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-lg text-amber-800">Shiprocket Return Pickup</h4>
                    <p className="text-sm text-neutral-600 mt-1">This return request has been approved. Click below to schedule a return courier pickup on Shiprocket, assign courier, and generate return AWB.</p>
                  </div>
                  <button 
                    onClick={handleScheduleReturnPickup}
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Scheduling Return...' : 'Schedule Return Pickup'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Update Status To</label>
                      <select 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                      >
                        <option value={returnReq.status} disabled>{returnReq.status} (Current)</option>
                        {allowedStatuses.map((s: string) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Internal Notes (Optional)</label>
                      <input 
                        type="text"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Visible in timeline"
                        className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || newStatus === returnReq.status}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              )
            )}

            {/* Quality Check Section */}
            {returnReq.status === 'Received' && (
              <div className="space-y-6 border border-primary/20 bg-primary/5 rounded-xl p-5">
                <div>
                  <h4 className="font-bold text-lg text-primary">Perform Quality Check</h4>
                  <p className="text-sm text-muted-foreground mt-1">Verify returned items. Good items restock inventory, Damaged items go to Damaged Inventory.</p>
                </div>

                <div className="space-y-4">
                  {qcItems.map((qc, idx) => {
                    const productInfo = returnReq.products.find((p: any) => p.product._id === qc.productId);
                    return (
                      <div key={idx} className="bg-background border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 md:items-center">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{productInfo?.product?.name}</p>
                          <p className="text-xs text-muted-foreground">Returning Qty: {productInfo?.quantity}</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <select 
                            value={qc.condition}
                            onChange={(e) => {
                              const newQc = [...qcItems];
                              newQc[idx].condition = e.target.value as 'Good' | 'Damaged';
                              setQcItems(newQc);
                            }}
                            className="p-2 border border-border rounded-lg text-sm bg-background outline-none"
                          >
                            <option value="Good">Good (Restock)</option>
                            <option value="Damaged">Damaged (Discard)</option>
                          </select>
                          {qc.condition === 'Damaged' && (
                            <input 
                              type="text" 
                              placeholder="Reason for damage" 
                              value={qc.reason}
                              onChange={(e) => {
                                const newQc = [...qcItems];
                                newQc[idx].reason = e.target.value;
                                setQcItems(newQc);
                              }}
                              className="p-2 border border-border rounded-lg text-sm bg-background outline-none flex-1"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={handleQualityCheck}
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium w-full md:w-auto"
                >
                  Complete Quality Check & Move Status
                </button>
              </div>
            )}

            {/* Refund Section */}
            {(returnReq.status === 'Quality Check' || returnReq.status === 'Refund Approved') && (
              <div className="space-y-6 border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-5 mt-6">
                <div>
                  <h4 className="font-bold text-lg text-emerald-600 flex items-center">
                    <DollarSign className="w-5 h-5 mr-1" />
                    Process Manual Refund
                  </h4>
                  <p className="text-sm text-emerald-600/80 mt-1">
                    Transfer <strong className="font-bold">₹{returnReq.totalRefundAmount.toLocaleString('en-IN')}</strong> to UPI ID <strong className="font-bold">{returnReq.upiDetails}</strong>, then enter the Transaction Reference below to complete the refund.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-sm font-medium mb-1 block">UPI Transaction Reference Number</label>
                    <input 
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. 319284759392"
                      className="w-full p-3 rounded-xl border border-emerald-200 bg-background focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleProcessRefund}
                    disabled={isUpdating}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold w-full md:w-auto transition-colors"
                  >
                    Complete Refund
                  </button>
                </div>
              </div>
            )}

            {allowedStatuses.length === 0 && returnReq.status !== 'Received' && returnReq.status !== 'Quality Check' && returnReq.status !== 'Refund Approved' && (
              <p className="text-muted-foreground text-sm">No further actions available for this status.</p>
            )}
          </div>

          {/* Returned Items */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Returned Products</h3>
            <div className="space-y-4">
              {returnReq.products.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 border border-border rounded-xl">
                  <div className="w-20 h-20 bg-secondary rounded-lg border border-border overflow-hidden shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Box className="w-8 h-8 m-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Link href={`/product/${item.product?._id}`} className="font-medium text-primary hover:underline">
                      {item.product?.name || 'Unknown Item'}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">SKU: {item.product?.sku}</p>
                    <p className="text-sm mt-2">Returning Qty: <strong>{item.quantity}</strong></p>
                    <p className="text-sm">Refund Amount: <strong>₹{item.refundAmount.toLocaleString('en-IN')}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Details</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{returnReq.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{returnReq.user?.email}</p>
                  <p className="text-xs text-muted-foreground">{returnReq.user?.phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Original Order</h3>
              <Link href={`/admin/orders/${returnReq.order?.orderId}`} className="flex items-center justify-between group">
                <p className="font-medium group-hover:text-primary transition-colors">{returnReq.order?.orderId}</p>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">UPI ID for Refund</h3>
              <p className="font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 font-mono text-sm break-all">
                {returnReq.upiDetails}
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Refund Required</h3>
              <p className="text-3xl font-bold text-primary">₹{returnReq.totalRefundAmount.toLocaleString('en-IN')}</p>
            </div>

            {returnReq.awbNumber && (
              <div className="pt-4 border-t border-border space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Return Shipping</h3>
                <p className="font-semibold text-neutral-950 text-sm">Courier: {returnReq.courierName}</p>
                <p className="text-xs text-neutral-500">AWB: <span className="font-mono">{returnReq.awbNumber}</span></p>
                {returnReq.pickupStatus && (
                  <p className="text-xs text-neutral-500 mt-0.5">Status: <span className="text-primary font-medium">{returnReq.pickupStatus}</span></p>
                )}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Return Reason</h3>
            <p className="font-medium">{returnReq.reason}</p>
            {returnReq.notes && (
              <p className="text-sm text-muted-foreground mt-2 bg-secondary/50 p-3 rounded-lg border border-border italic">"{returnReq.notes}"</p>
            )}
          </div>

          {returnReq.images?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Evidence Images
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {returnReq.images.map((img: string, idx: number) => (
                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity">
                    <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
