"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Package, Download, Save, CreditCard, CheckCircle2 } from 'lucide-react';
import { generateInvoicePDF } from '@/frontend/lib/InvoiceGenerator';

import { Truck, Printer, HelpCircle } from 'lucide-react';

export default function AdminOrderDetailsClient({ initialOrder }: { initialOrder: any }) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(initialOrder.status);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Shiprocket states
  const [weight, setWeight] = useState(0.5);
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [isShiprocketLoading, setIsShiprocketLoading] = useState(false);
  const [docsUrls, setDocsUrls] = useState<{ labelUrl?: string; manifestUrl?: string } | null>(null);

  // Shiprocket API Handlers
  const handleCreateShipment = async () => {
    setIsShiprocketLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight, length, width, height })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create shipment');
      }
      const data = await res.json();
      setSuccess('Shipment created successfully on Shiprocket!');
      // Update order local state
      setOrder({ ...order, shipmentId: data.shipmentId, shipmentStatus: 'Created' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsShiprocketLoading(false);
    }
  };

  const handleFetchCouriers = async () => {
    setIsLoadingCouriers(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(
        `/api/admin/shipping/couriers?deliveryPincode=${order.shippingAddress.postalCode}&weight=${weight}&isCod=${order.paymentMethod === 'COD'}&orderValue=${order.totalAmount}`
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to fetch couriers');
      }
      const data = await res.json();
      setCouriers(data.couriers || []);
      if (data.couriers?.length > 0) {
        setSelectedCourier(data.couriers[0]);
      } else {
        setError('No serviceable couriers found for this pincode.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  const handleAssignCourier = async (courierToAssign: any) => {
    if (!courierToAssign) return;
    setIsShiprocketLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/courier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courierId: courierToAssign.courier_company_id,
          courierName: courierToAssign.courier_name,
          rate: courierToAssign.rate,
          etd: courierToAssign.etd
        })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to assign courier');
      }
      const data = await res.json();
      setSuccess(`AWB ${data.awbNumber} assigned successfully with ${data.courierName}!`);
      setOrder({ 
        ...order, 
        awbNumber: data.awbNumber, 
        trackingNumber: data.awbNumber, 
        courierName: data.courierName,
        shipmentStatus: 'AWB Assigned' 
      });
      setCouriers([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsShiprocketLoading(false);
    }
  };

  const handleAutoSelectCheapest = () => {
    if (couriers.length === 0) return;
    // Sort couriers by rate ascending
    const sorted = [...couriers].sort((a, b) => a.rate - b.rate);
    handleAssignCourier(sorted[0]);
  };

  const handleSchedulePickup = async () => {
    setIsShiprocketLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupDate })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to schedule pickup');
      }
      const data = await res.json();
      setSuccess(`Pickup scheduled successfully! ID: ${data.pickupId}`);
      setOrder({ 
        ...order, 
        pickupId: data.pickupId, 
        pickupStatus: data.pickupStatus,
        shipmentStatus: 'Pickup Scheduled' 
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsShiprocketLoading(false);
    }
  };

  const handleFetchDocuments = async () => {
    setIsShiprocketLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/label`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to generate documents');
      }
      const data = await res.json();
      setDocsUrls({ labelUrl: data.labelUrl, manifestUrl: data.manifestUrl });
      setSuccess('Shipping documents fetched successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsShiprocketLoading(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!confirm('Are you sure you want to cancel the shipment? This will void the AWB.')) return;
    setIsShiprocketLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/cancel-shipment`, {
        method: 'POST'
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to cancel shipment');
      }
      setSuccess('Shipment cancelled successfully.');
      setOrder({ 
        ...order, 
        awbNumber: undefined, 
        trackingNumber: undefined, 
        shipmentId: undefined, 
        pickupId: undefined, 
        pickupStatus: undefined,
        shipmentStatus: 'Cancelled' 
      });
      setDocsUrls(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsShiprocketLoading(false);
    }
  };

  const validTransitions: any = {
    'Order Placed': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Packed', 'Cancelled'],
    'Packed': ['Shipped'], 
    'Shipped': ['Out For Delivery'],
    'Out For Delivery': ['Delivered'],
    'Delivered': ['Returned'],
    'Cancelled': [],
    'Returned': []
  };

  const availableOptions = validTransitions[order.status] || [];

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === order.status) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      const updatedOrder = await res.json();
      setOrder({ ...order, ...updatedOrder });
      setNotes('');
      setSuccess(`Order status successfully updated to ${status}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin/orders" className="text-sm font-medium text-gray-500 hover:text-black flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>
        <button 
          onClick={() => generateInvoicePDF(order)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-black/80"
        >
          <Download className="w-4 h-4 mr-2" /> Download Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Status Update Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Update Order Status</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
            {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</div>}
            
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <input type="text" disabled value={order.status} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={availableOptions.length === 0}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value={order.status}>No Change</option>
                    {availableOptions.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={availableOptions.length === 0}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none h-20 resize-none disabled:bg-gray-50"
                  placeholder="E.g., Courier tracking ID: 123456789"
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isUpdating || status === order.status}
                  className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center hover:bg-black/80 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-400" /> Products Ordered
            </h2>
            <div className="divide-y divide-gray-100">
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
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                        <img 
                          src={imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.finalPrice}</p>
                      {item.discount > 0 && <p className="text-xs text-green-600">Disc: ₹{item.discount}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{order.totalAmount + order.discount - order.deliveryCharges}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Total Discount</span>
                <span>-₹{order.discount}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charges</span>
                <span>{order.deliveryCharges === 0 ? 'Free' : `₹${order.deliveryCharges}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Grand Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
          
          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-6">Activity Timeline</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {order.trackingTimeline.map((item: any, idx: number) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-100 group-[.is-active]:bg-black text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-gray-900 text-sm">{item.status}</div>
                      <time className="text-xs font-medium text-gray-500">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                    </div>
                    {item.note && <div className="text-gray-500 text-xs mt-2">{item.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Customer / Shipping Info */}
        <div className="space-y-8">
          {(() => {
            const addr = (typeof order.shippingAddress === 'object' && order.shippingAddress && (order.shippingAddress.fullName || order.shippingAddress.street)) 
              ? order.shippingAddress 
              : (order.shippingAddressSnapshot || null);
            const name = order.user?.name || addr?.fullName || 'Guest User';
            const email = order.user?.email || addr?.email || 'N/A';
            const phone = order.user?.phone || addr?.phone || 'N/A';

            return (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-400" /> Customer Details
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Name</p>
                      <p className="font-medium">{name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-medium">{email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="font-medium">{phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" /> Shipping Address
                  </h2>
                  {addr && (addr.fullName || addr.street || addr.city || addr.phone) ? (
                    <div className="text-sm space-y-1 text-gray-700">
                      {addr.fullName && <p className="font-medium text-gray-900 mb-2">{addr.fullName}</p>}
                      {(addr.houseNo || addr.street) && (
                        <p>{[addr.houseNo, addr.street].filter(Boolean).join(', ')}</p>
                      )}
                      {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                      {(addr.area || addr.city) && (
                        <p>{[addr.area, addr.city].filter(Boolean).join(', ')}</p>
                      )}
                      {(addr.state || addr.postalCode) && (
                        <p>{[addr.state, addr.postalCode].filter(Boolean).join(' - ')}</p>
                      )}
                      {addr.phone && (
                        <p className="mt-3 font-medium">
                          Phone: {addr.phone}
                          {(addr.alternatePhone || addr.alternateMobile) && `, ${addr.alternatePhone || addr.alternateMobile}`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No address details available.</p>
                  )}
                </div>
              </>
            );
          })()}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-400" /> Payment Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Status</p>
                <span className={`inline-flex mt-1 px-2.5 py-1 text-xs rounded-full border font-medium 
                  ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}
                `}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Shiprocket Logistics Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-gray-400" /> Shiprocket Logistics
            </h2>

            {isShiprocketLoading && (
              <div className="text-sm text-gray-500 animate-pulse py-2 text-center">Processing with Shiprocket API...</div>
            )}

            {/* Step 1: Create Shipment */}
            {!order.shipmentId && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">Enter package metrics to register this order with Shiprocket.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-600 mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={weight} 
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Length (cm)</label>
                    <input 
                      type="number" 
                      value={length} 
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Width (cm)</label>
                    <input 
                      type="number" 
                      value={width} 
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateShipment}
                  disabled={isShiprocketLoading}
                  className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-50"
                >
                  Generate Shipment
                </button>
              </div>
            )}

            {/* Step 2: Courier Selection */}
            {order.shipmentId && !order.awbNumber && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-gray-700">Shipment Created</p>
                  <p className="text-gray-500 mt-1">ID: {order.shipmentId}</p>
                </div>

                {couriers.length === 0 ? (
                  <button
                    onClick={handleFetchCouriers}
                    disabled={isLoadingCouriers}
                    className="w-full border border-black hover:bg-gray-50 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoadingCouriers ? 'Checking Serviceability...' : 'Fetch Available Couriers'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-600">Select Courier Partner</p>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {couriers.map((c) => (
                        <div 
                          key={c.courier_company_id} 
                          onClick={() => setSelectedCourier(c)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            selectedCourier?.courier_company_id === c.courier_company_id
                              ? 'border-black bg-gray-50 font-medium'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between font-semibold">
                            <span>{c.courier_name}</span>
                            <span>₹{c.rate}</span>
                          </div>
                          <div className="flex justify-between text-gray-500 mt-1 text-[10px]">
                            <span>Delivery ETD: {c.etd}</span>
                            <span>Rating: {c.rating} ⭐</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAutoSelectCheapest}
                        disabled={isShiprocketLoading}
                        className="flex-1 border border-black py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cheapest Courier
                      </button>
                      <button
                        onClick={() => handleAssignCourier(selectedCourier)}
                        disabled={isShiprocketLoading || !selectedCourier}
                        className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-semibold hover:bg-black/80 transition-colors disabled:opacity-50"
                      >
                        Assign Selected
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Schedule Pickup */}
            {order.awbNumber && !order.pickupId && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Courier Assigned</p>
                  <p className="text-gray-500">Partner: {order.courierName}</p>
                  <p className="text-gray-500">AWB: <span className="font-mono">{order.awbNumber}</span></p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-600">Select Pickup Date</label>
                  <input 
                    type="date" 
                    value={pickupDate} 
                    min={todayStr}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCancelShipment}
                    disabled={isShiprocketLoading}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel Shipment
                  </button>
                  <button
                    onClick={handleSchedulePickup}
                    disabled={isShiprocketLoading}
                    className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-semibold hover:bg-black/80 transition-colors"
                  >
                    Schedule Pickup
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Documents & Tracking Details */}
            {order.pickupId && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs space-y-1">
                  <p className="font-semibold text-green-700">Pickup Scheduled</p>
                  <p className="text-gray-500">Pickup ID: {order.pickupId}</p>
                  <p className="text-gray-500">Partner: {order.courierName}</p>
                  <p className="text-gray-500">AWB: <span className="font-mono">{order.awbNumber}</span></p>
                  {order.shipmentStatus && (
                    <p className="text-gray-500">Live Status: <span className="text-black font-semibold">{order.shipmentStatus}</span></p>
                  )}
                </div>

                {!docsUrls ? (
                  <button
                    onClick={handleFetchDocuments}
                    disabled={isShiprocketLoading}
                    className="w-full border border-black hover:bg-gray-50 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Generate Shipping Docs
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {docsUrls.labelUrl && (
                      <a 
                        href={docsUrls.labelUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="border border-neutral-300 hover:bg-gray-50 py-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Label
                      </a>
                    )}
                    {docsUrls.manifestUrl && (
                      <a 
                        href={docsUrls.manifestUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="border border-neutral-300 hover:bg-gray-50 py-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Manifest
                      </a>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCancelShipment}
                    disabled={isShiprocketLoading}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel Shipment
                  </button>
                  <Link
                    href={`/orders/track/${order.trackingNumber}`}
                    target="_blank"
                    className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-semibold text-center hover:bg-black/80 transition-colors flex items-center justify-center"
                  >
                    Track Shipment
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
