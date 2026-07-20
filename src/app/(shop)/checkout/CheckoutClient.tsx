"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/frontend/store/useCartStore";
import { useCheckoutStore } from "@/frontend/store/useCheckoutStore";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, MapPin, CreditCard, ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";
import Script from "next/script";

interface CheckoutClientProps {
  session: any;
}

export default function CheckoutClient({ session }: CheckoutClientProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { step, setStep, selectedAddressId, setSelectedAddressId, couponCode, setCouponCode, resetCheckout } = useCheckoutStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('COD');
  
  // New Address Form State
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "", phone: "", email: "", houseNo: "", street: "", area: "", city: "", district: "", state: "", postalCode: "", addressType: "Home"
  });



  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        if (data.length > 0 && !selectedAddressId) {
          const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr._id);
        } else if (data.length === 0) {
          setShowNewAddress(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate phone number (Indian mobile: 10 digits, starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    const rawPhone = newAddress.phone.replace(/[\s+\-()]/g, '');
    if (!rawPhone || !phoneRegex.test(rawPhone)) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/shop/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddress, phone: rawPhone })
      });
      if (res.ok) {
        const saved = await res.json();
        setAddresses([...addresses, saved]);
        setSelectedAddressId(saved._id);
        setShowNewAddress(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save address.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop/checkout/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode })
      });
      if (res.ok) {
        const data = await res.json();
        setTotals(data);
      } else {
        const err = await res.json();
        alert(err.error);
        if (couponCode) setCouponCode(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/checkout");
    } else {
      fetchAddresses();
    }
  }, [session, router]);

  useEffect(() => {
    if (step === 3 && items.length > 0) {
      validateCheckout();
    }
  }, [step, items]);

  const handleApplyCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get("coupon") as string;
    if (code) {
      setCouponCode(code);
      // Trigger validation again via effect
      setTimeout(() => validateCheckout(), 100);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return alert('Please select a delivery address.');
    // Ensure the selected address has a phone number
    const selectedAddr = addresses.find((a: any) => a._id === selectedAddressId);
    if (!selectedAddr?.phone) {
      return alert('The selected address is missing a contact number. Please add a valid address with a mobile number.');
    }
    setLoading(true);
    try {
      // Step A: Place the local order first with pending payment status
      const res = await fetch('/api/shop/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: selectedAddressId, couponCode, paymentMethod })
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const localOrderId = data.orderId;

      if (paymentMethod === 'COD') {
        clearCart();
        resetCheckout();
        router.push(`/checkout/success/${localOrderId}`);
      } else {
        // Step B: Call backend to create Razorpay Order
        const rpRes = await fetch('/api/shop/checkout/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: localOrderId })
        });

        if (!rpRes.ok) {
          const rpErr = await rpRes.json();
          alert(rpErr.error || 'Failed to initialize online payment');
          setLoading(false);
          return;
        }

        const rpData = await rpRes.json();

        // Step C: Trigger Razorpay Checkout Modal
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rpData.amount,
          currency: rpData.currency,
          name: 'Radhika Jewellers',
          description: 'Payment for Order #' + localOrderId,
          image: '/icon.png',
          order_id: rpData.order_id,
          handler: async function (response: any) {
            setLoading(true);
            try {
              // Step D: Send signature verification to backend
              const verifyRes = await fetch('/api/shop/checkout/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: localOrderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                })
              });

              if (verifyRes.ok) {
                clearCart();
                resetCheckout();
                router.push(`/checkout/success/${localOrderId}`);
              } else {
                const verifyErr = await verifyRes.json();
                alert(verifyErr.error || 'Payment signature verification failed.');
              }
            } catch (err) {
              console.error('Payment verification request failed:', err);
              alert('An error occurred during payment verification.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
          theme: {
            color: '#8c765c'
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              alert('Payment modal closed. You can complete this payment later or select COD.');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert('Payment failed: ' + response.error.description);
          setLoading(false);
        });
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while placing your order.');
      setLoading(false);
    }
  };

  if (!session?.user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (items.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-playfair mb-4">Your Cart is Empty</h2>
        <button onClick={() => router.push('/shop')} className="bg-primary text-primary-foreground px-8 py-3 rounded-full uppercase tracking-wider text-sm font-medium hover:opacity-90 transition-opacity">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-4xl font-playfair font-bold text-center mb-12">Checkout</h1>
        
        {/* Stepper */}
        <div className="flex justify-center items-center mb-12">
          <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>1</div>
            <span className="ml-2 font-medium hidden md:block">Address</span>
          </div>
          <div className={`w-16 h-px mx-4 ${step >= 3 ? 'bg-primary' : 'bg-border'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>2</div>
            <span className="ml-2 font-medium hidden md:block">Summary</span>
          </div>
          <div className={`w-16 h-px mx-4 ${step >= 4 ? 'bg-primary' : 'bg-border'}`}></div>
          <div className={`flex items-center ${step >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>3</div>
            <span className="ml-2 font-medium hidden md:block">Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              
              {/* STEP 2: ADDRESS */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-playfair mb-6 flex items-center"><MapPin className="mr-3" /> Delivery Address</h2>
                  
                  {!showNewAddress ? (
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr._id} 
                          onClick={() => setSelectedAddressId(addr._id)}
                          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-lg">{addr.fullName} <span className="text-xs ml-2 bg-secondary px-2 py-1 rounded-full uppercase">{addr.addressType}</span></p>
                              <p className="text-muted-foreground mt-1 text-sm">{addr.houseNo}, {addr.street}</p>
                              <p className="text-muted-foreground text-sm">{addr.area}, {addr.city}, {addr.state} {addr.postalCode}</p>
                              <p className="text-muted-foreground text-sm mt-2">Mobile: {addr.phone}</p>
                            </div>
                            {selectedAddressId === addr._id && <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="w-4 h-4" /></div>}
                          </div>
                        </div>
                      ))}
                      
                      <button onClick={() => setShowNewAddress(true)} className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-medium hover:border-primary hover:text-primary transition-colors">
                        + Add New Address
                      </button>

                      <div className="mt-8 flex justify-end">
                        <button 
                          onClick={() => setStep(3)} 
                          disabled={!selectedAddressId}
                          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium tracking-wider uppercase text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                          Continue to Summary
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="space-y-4 bg-secondary/20 p-6 rounded-2xl border border-border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fullName" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Full Name</label>
                          <input id="fullName" required type="text" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Mobile Number <span className="text-red-500">*</span></label>
                          <input id="phone" required type="tel" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit mobile number" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Email Address</label>
                          <input id="email" required type="email" value={newAddress.email} onChange={e => setNewAddress({...newAddress, email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="houseNo" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">House / Flat No</label>
                          <input id="houseNo" required type="text" value={newAddress.houseNo} onChange={e => setNewAddress({...newAddress, houseNo: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="street" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Street</label>
                          <input id="street" required type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="area" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Area / Locality</label>
                          <input id="area" required type="text" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="postalCode" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">PIN Code</label>
                          <input id="postalCode" required type="text" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">City</label>
                          <input id="city" required type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="district" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">District</label>
                          <input id="district" required type="text" value={newAddress.district} onChange={e => setNewAddress({...newAddress, district: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">State</label>
                          <input id="state" required type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3" />
                        </div>
                        <div>
                          <label htmlFor="addressType" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Address Type</label>
                          <select id="addressType" required value={newAddress.addressType} onChange={e => setNewAddress({...newAddress, addressType: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3">
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4 mt-6">
                        <button type="button" onClick={() => addresses.length > 0 ? setShowNewAddress(false) : null} className="flex-1 py-3 border border-border rounded-full font-medium hover:bg-secondary transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
                          {loading ? 'Saving...' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* STEP 3: SUMMARY */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-playfair mb-6 flex items-center"><ShoppingBag className="mr-3" /> Order Summary</h2>
                  
                  <div className="space-y-6">
                    {/* Items */}
                    <div className="bg-secondary/10 border border-border rounded-2xl p-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-border/50 last:border-0 last:pb-0">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white">
                            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                          </div>
                          <div className="font-medium text-primary">₹{item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>

                    {/* Coupon */}
                    <div className="bg-secondary/10 border border-border rounded-2xl p-6">
                      <h4 className="font-medium mb-4 uppercase tracking-wider text-sm">Apply Coupon</h4>
                      <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                        <input name="coupon" type="text" defaultValue={couponCode || ""} placeholder="Enter coupon code" className="flex-1 bg-background border border-border rounded-xl px-4 py-2 uppercase" />
                        <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium">Apply</button>
                      </form>
                      {couponCode && (
                        <div className="mt-3 flex items-center justify-between text-sm text-green-600 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                          <span>Coupon <b>{couponCode}</b> applied!</span>
                          <button type="button" onClick={() => { setCouponCode(null); setTimeout(() => validateCheckout(), 100); }} className="text-red-500 underline">Remove</button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(2)} className="py-3 px-6 border border-border rounded-full font-medium hover:bg-secondary transition-colors text-sm uppercase tracking-wider">Back to Address</button>
                      <button onClick={() => setStep(4)} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity">
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: PAYMENT */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-playfair mb-6 flex items-center"><CreditCard className="mr-3" /> Payment Method</h2>
                  
                  <div className="space-y-4">
                    <div 
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-6 rounded-2xl border-2 flex items-center space-x-4 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/35'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        ₹
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">Cash on Delivery (COD)</h4>
                        <p className="text-muted-foreground text-sm">Pay at your doorstep when receiving the order.</p>
                      </div>
                      {paymentMethod === 'COD' && <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="w-4 h-4" /></div>}
                    </div>
                    
                    <div 
                      onClick={() => setPaymentMethod('Razorpay')}
                      className={`p-6 rounded-2xl border-2 flex items-center space-x-4 cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/35'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'Razorpay' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">Online Payment (Razorpay)</h4>
                        <p className="text-muted-foreground text-sm">Credit Card, UPI, Netbanking, Wallets (Secure & Instant)</p>
                      </div>
                      {paymentMethod === 'Razorpay' && <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="w-4 h-4" /></div>}
                    </div>

                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(3)} className="py-3 px-6 border border-border rounded-full font-medium hover:bg-secondary transition-colors text-sm uppercase tracking-wider">Back to Summary</button>
                      <button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity flex items-center"
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {loading ? 'Processing...' : 'Place Order Now'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right: Sticky Order Totals */}
          <div className="w-full lg:w-1/3">
            <div className="bg-secondary/10 border border-border rounded-3xl p-8 sticky top-24">
              <h3 className="text-xl font-playfair font-bold mb-6">Price Breakdown</h3>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totals ? totals.subtotal : items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                </div>
                
                {(totals ? totals.discount > 0 : false) && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span className="font-medium">-₹{totals.discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  {totals ? (
                    totals.deliveryCharges === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span className="font-medium">₹{totals.deliveryCharges}</span>
                  ) : (
                    <span className="text-muted-foreground italic">Calculated at summary</span>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t border-border flex justify-between items-end">
                <span className="font-medium text-lg uppercase tracking-wider">Total</span>
                <span className="text-3xl font-playfair font-bold text-primary">
                  ₹{totals ? totals.totalAmount : items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
