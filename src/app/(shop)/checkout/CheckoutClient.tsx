"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/frontend/store/useCartStore";
import { useCheckoutStore } from "@/frontend/store/useCheckoutStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, ChevronRight, MapPin, CreditCard, ShoppingBag, Loader2,
  ShieldCheck, Truck, RotateCcw, Lock, Tag, Sparkles, Plus, Trash2, ArrowLeft
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { cn } from "@/shared/lib/utils";

interface CheckoutClientProps {
  session: any;
}

export default function CheckoutClient({ session }: CheckoutClientProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { step, setStep, selectedAddressId, setSelectedAddressId, couponCode, setCouponCode, resetCheckout } = useCheckoutStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [totals, setTotals] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('Razorpay');
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  // New Address Form State
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    email: session?.user?.email || "",
    houseNo: "",
    street: "",
    area: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",
    addressType: "Home"
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
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeLookup = async (pincode: string) => {
    setNewAddress((prev) => ({ ...prev, postalCode: pincode }));
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            setNewAddress((prev) => ({
              ...prev,
              city: po.Block !== 'NA' && po.Block ? po.Block : po.Name,
              district: po.District,
              state: po.State,
              area: prev.area || po.Name
            }));
          }
        }
      } catch (err) {
        console.error('Failed to lookup pincode:', err);
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;
    const rawPhone = newAddress.phone.replace(/[\s+\-()]/g, '');
    if (!rawPhone || !phoneRegex.test(rawPhone)) {
      alert('Please enter a valid 10-digit Indian mobile number starting with 6-9.');
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
    if (items.length === 0) return;
    try {
      const res = await fetch('/api/shop/checkout/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          couponCode,
          items: items.map(i => ({ id: i.id, quantity: i.quantity }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTotals(data);
        setCouponError("");
      } else {
        const err = await res.json();
        setCouponError(err.error || "Invalid coupon code.");
        if (couponCode) setCouponCode(null);
      }
    } catch (err) {
      console.error(err);
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
    if (items.length > 0) {
      validateCheckout();
    }
  }, [couponCode, items]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponCode(couponInput.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setCouponCode(null);
    setCouponInput("");
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return alert('Your cart is empty. Please add products to checkout.');
    if (!selectedAddressId) return alert('Please select a delivery address.');
    const selectedAddr = addresses.find((a: any) => a._id === selectedAddressId);
    if (!selectedAddr?.phone) {
      return alert('The selected address is missing a mobile number. Please edit or re-select an address with a contact number.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/shop/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          addressId: selectedAddressId, 
          couponCode, 
          paymentMethod,
          items: items.map(i => ({ id: i.id, quantity: i.quantity }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to initialize order');
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
        // Razorpay Online Payment Flow
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

        // Dynamically load Razorpay SDK if not present on window
        const loadScript = () => {
          return new Promise<boolean>((resolve) => {
            if ((window as any).Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const isScriptLoaded = await loadScript();
        if (!isScriptLoaded || !(window as any).Razorpay) {
          alert('Failed to load Razorpay Payment Gateway SDK. Please check your internet connection and try again.');
          setLoading(false);
          return;
        }

        const activeKey = rpData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TEEygPJ4TOEaHW';

        const options: any = {
          key: activeKey,
          amount: rpData.amount,
          currency: rpData.currency || 'INR',
          name: 'Radhika Jewellers',
          description: `Payment for Order #${localOrderId}`,
          image: '/icon.png',
          handler: async function (response: any) {
            setLoading(true);
            try {
              const verifyRes = await fetch('/api/shop/checkout/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: localOrderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || '',
                  razorpay_signature: response.razorpay_signature || '',
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
              console.error('Payment verification failed:', err);
              alert('An error occurred during payment verification.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: selectedAddr.fullName || session?.user?.name || '',
            email: selectedAddr.email || session?.user?.email || '',
            contact: selectedAddr.phone || '',
          },
          theme: {
            color: '#d97706' // Warm Gold
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        if (rpData.order_id) {
          options.order_id = rpData.order_id;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert('Payment failed: ' + (response.error?.description || 'Payment was declined'));
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

  const calculatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotalAmount = totals ? totals.totalAmount : calculatedSubtotal;
  const currentStep = step || 1;

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-background px-4 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 text-amber-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-playfair font-bold text-foreground mb-3">Your Shopping Bag is Empty</h2>
        <p className="text-muted-foreground max-w-md mb-8">Discover our handcrafted Kundan, Gold-plated, and Bridal artificial jewellery collection.</p>
        <button 
          onClick={() => router.push('/shop')} 
          className="bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-foreground mb-2">
            Express <span className="text-gradient-gold italic font-normal">Checkout</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Complete your order securely with insured courier delivery</p>
        </div>
        
        {/* Luxury Stepper */}
        <div className="flex justify-center items-center mb-12 max-w-xl mx-auto px-4">
          
          {/* Step 1: Address */}
          <div 
            onClick={() => setStep(1)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xs",
              currentStep === 1 
                ? "bg-amber-500 text-neutral-950 ring-4 ring-amber-500/20 font-black scale-105" 
                : currentStep > 1 
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/40" 
                : "bg-secondary text-muted-foreground"
            )}>
              {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider mt-2 transition-colors",
              currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
            )}>Address</span>
          </div>

          <div className={cn("flex-1 h-0.5 mx-4 transition-colors duration-500", currentStep >= 2 ? "bg-amber-500" : "bg-border/60")} />

          {/* Step 2: Summary */}
          <div 
            onClick={() => selectedAddressId && setStep(2)}
            className={cn("flex flex-col items-center group", selectedAddressId ? "cursor-pointer" : "cursor-not-allowed opacity-60")}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xs",
              currentStep === 2 
                ? "bg-amber-500 text-neutral-950 ring-4 ring-amber-500/20 font-black scale-105" 
                : currentStep > 2 
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/40" 
                : "bg-secondary text-muted-foreground"
            )}>
              {currentStep > 2 ? <Check className="w-5 h-5" /> : "2"}
            </div>
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider mt-2 transition-colors",
              currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
            )}>Summary</span>
          </div>

          <div className={cn("flex-1 h-0.5 mx-4 transition-colors duration-500", currentStep >= 3 ? "bg-amber-500" : "bg-border/60")} />

          {/* Step 3: Payment */}
          <div 
            onClick={() => selectedAddressId && setStep(3)}
            className={cn("flex flex-col items-center group", selectedAddressId ? "cursor-pointer" : "cursor-not-allowed opacity-60")}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xs",
              currentStep === 3 
                ? "bg-amber-500 text-neutral-950 ring-4 ring-amber-500/20 font-black scale-105" 
                : "bg-secondary text-muted-foreground"
            )}>
              3
            </div>
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider mt-2 transition-colors",
              currentStep === 3 ? "text-foreground" : "text-muted-foreground"
            )}>Payment</span>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Left Content Area */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: ADDRESS */}
              {currentStep === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-playfair font-bold text-foreground flex items-center">
                      <MapPin className="w-5 h-5 mr-2.5 text-amber-500" /> 1. Shipping Address
                    </h2>
                    {!showNewAddress && addresses.length > 0 && (
                      <button 
                        onClick={() => setShowNewAddress(true)}
                        className="text-xs font-bold text-amber-500 hover:underline flex items-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add New Address
                      </button>
                    )}
                  </div>
                  
                  {!showNewAddress ? (
                    <div className="space-y-4">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div 
                            key={addr._id} 
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={cn(
                              "p-5 rounded-2xl border-2 transition-all cursor-pointer relative",
                              isSelected 
                                ? "border-amber-500 bg-amber-500/5 shadow-xs" 
                                : "border-border/60 hover:border-amber-500/50 bg-secondary/20"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-base text-foreground">{addr.fullName}</span>
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                                    {addr.addressType || 'Home'}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{addr.houseNo}, {addr.street}, {addr.area}</p>
                                <p className="text-xs text-muted-foreground">{addr.city}, {addr.district ? `${addr.district}, ` : ''}{addr.state} - <strong className="text-foreground">{addr.postalCode}</strong></p>
                                <p className="text-xs text-foreground font-semibold pt-1">📞 Mobile: {addr.phone}</p>
                              </div>

                              <div className={cn(
                                "w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-0.5",
                                isSelected ? "border-amber-500 bg-amber-500 text-neutral-950" : "border-border/60"
                              )}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {addresses.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No saved addresses found. Please add a shipping address below.</p>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button 
                          onClick={() => setStep(2)} 
                          disabled={!selectedAddressId}
                          className="bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          Deliver to this Address →
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* New Address Form */
                    <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Full Name *</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="e.g. Priya Sharma"
                            value={newAddress.fullName} 
                            onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Mobile Phone (10 digits) *</label>
                          <input 
                            required 
                            type="tel" 
                            pattern="[6-9][0-9]{9}" 
                            maxLength={10} 
                            placeholder="e.g. 9876543210" 
                            value={newAddress.phone} 
                            onChange={e => setNewAddress({...newAddress, phone: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address (For Invoice) *</label>
                          <input 
                            required 
                            type="email" 
                            placeholder="email@example.com"
                            value={newAddress.email} 
                            onChange={e => setNewAddress({...newAddress, email: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Flat / House / Building No. *</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="Flat 402, Royal Residency"
                            value={newAddress.houseNo} 
                            onChange={e => setNewAddress({...newAddress, houseNo: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Street / Road *</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="MG Road, 4th Cross"
                            value={newAddress.street} 
                            onChange={e => setNewAddress({...newAddress, street: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Area / Landmark *</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="Near City Mall"
                            value={newAddress.area} 
                            onChange={e => setNewAddress({...newAddress, area: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">PIN Code (Auto Fill) *</label>
                          <div className="relative">
                            <input 
                              required 
                              type="text" 
                              maxLength={6}
                              placeholder="6-digit PIN code"
                              value={newAddress.postalCode} 
                              onChange={e => handlePincodeLookup(e.target.value)} 
                              className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                            />
                            {isFetchingPincode && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">City / Block *</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="City name"
                            value={newAddress.city} 
                            onChange={e => setNewAddress({...newAddress, city: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">State *</label>
                          <input 
                            required 
                            type="text" 
                            placeholder="State"
                            value={newAddress.state} 
                            onChange={e => setNewAddress({...newAddress, state: e.target.value})} 
                            className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500" 
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Address Type</label>
                          <div className="flex space-x-3">
                            {['Home', 'Office', 'Other'].map((type) => (
                              <button
                                type="button"
                                key={type}
                                onClick={() => setNewAddress({ ...newAddress, addressType: type })}
                                className={cn(
                                  "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                                  newAddress.addressType === type
                                    ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                    : "bg-secondary/30 border-border/60 text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        {addresses.length > 0 && (
                          <button 
                            type="button" 
                            onClick={() => setShowNewAddress(false)} 
                            className="flex-1 py-3 border border-border/60 rounded-full font-bold text-xs hover:bg-secondary transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="submit" 
                          disabled={loading} 
                          className="flex-1 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 py-3 rounded-full font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'Saving Address...' : 'Save & Select Address'}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* STEP 2: SUMMARY */}
              {currentStep === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h2 className="text-xl font-playfair font-bold text-foreground flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-2.5 text-amber-500" /> 2. Order Items Review
                    </h2>
                    <button onClick={() => setStep(1)} className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center">
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Change Address
                    </button>
                  </div>

                  {/* Item List */}
                  <div className="divide-y divide-border/40">
                    {items.map((item) => (
                      <div key={item.id} className="py-4 flex items-center space-x-4 first:pt-0 last:pb-0">
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-secondary/40 shrink-0 border border-border/40">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Img</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-playfair text-sm font-bold text-foreground truncate">{item.name}</h4>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.category || 'Jewellery'}</p>
                          <p className="text-xs font-semibold text-amber-500 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="flex items-center space-x-2 bg-secondary/40 border border-border/60 rounded-full px-2.5 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-xs text-muted-foreground hover:text-foreground w-4 h-4 flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-foreground px-1">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-xs text-muted-foreground hover:text-foreground w-4 h-4 flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-sm text-foreground">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] text-red-500 hover:underline mt-1 block ml-auto cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Discount Section */}
                  <div className="bg-secondary/20 border border-border/50 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Apply Promo / Coupon Code</h4>
                    </div>

                    <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="e.g. WELCOME10 or LUXURY500"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-background border border-border/60 rounded-xl px-4 py-2.5 text-xs text-foreground uppercase tracking-wider font-semibold focus:outline-none focus:border-amber-500" 
                      />
                      <button 
                        type="submit" 
                        className="bg-amber-500 text-neutral-950 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>

                    {couponCode && (
                      <div className="flex items-center justify-between text-xs text-emerald-500 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 font-medium">
                        <span className="flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1.5" /> Coupon <strong className="mx-1">{couponCode}</strong> applied successfully!
                        </span>
                        <button type="button" onClick={handleRemoveCoupon} className="text-red-500 hover:underline font-bold cursor-pointer">
                          Remove
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <p className="text-xs text-red-500 font-medium">{couponError}</p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button 
                      onClick={() => setStep(1)} 
                      className="py-3 px-6 border border-border/60 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors cursor-pointer"
                    >
                      ← Back to Address
                    </button>
                    <button 
                      onClick={() => setStep(3)} 
                      className="bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      Proceed to Payment →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT */}
              {currentStep === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h2 className="text-xl font-playfair font-bold text-foreground flex items-center">
                      <CreditCard className="w-5 h-5 mr-2.5 text-amber-500" /> 3. Payment Method
                    </h2>
                    <button onClick={() => setStep(2)} className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center">
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Edit Summary
                    </button>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Option 1: Razorpay Online Payment */}
                    <div 
                      onClick={() => setPaymentMethod('Razorpay')}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4",
                        paymentMethod === 'Razorpay' 
                          ? "border-amber-500 bg-amber-500/5 shadow-xs" 
                          : "border-border/60 hover:border-amber-500/50 bg-secondary/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        paymentMethod === 'Razorpay' ? "bg-amber-500 text-neutral-950" : "bg-secondary text-muted-foreground"
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-foreground">Online Instant Payment (Razorpay)</h4>
                          <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">UPI (GPay / PhonePe / Paytm), Credit & Debit Cards, NetBanking, Wallets</p>
                        <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center">
                          <Lock className="w-3 h-3 mr-1" /> 100% Insured 256-Bit Encrypted Payment
                        </p>
                      </div>

                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-0.5",
                        paymentMethod === 'Razorpay' ? "border-amber-500 bg-amber-500 text-neutral-950" : "border-border/60"
                      )}>
                        {paymentMethod === 'Razorpay' && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>
                    </div>

                    {/* Option 2: Cash on Delivery (COD) */}
                    <div 
                      onClick={() => setPaymentMethod('COD')}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4",
                        paymentMethod === 'COD' 
                          ? "border-amber-500 bg-amber-500/5 shadow-xs" 
                          : "border-border/60 hover:border-amber-500/50 bg-secondary/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-black text-sm",
                        paymentMethod === 'COD' ? "bg-amber-500 text-neutral-950" : "bg-secondary text-muted-foreground"
                      )}>
                        ₹
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-foreground">Cash on Delivery (COD)</h4>
                        <p className="text-xs text-muted-foreground mt-1">Pay with cash or UPI upon delivery at your doorstep.</p>
                      </div>

                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-0.5",
                        paymentMethod === 'COD' ? "border-amber-500 bg-amber-500 text-neutral-950" : "border-border/60"
                      )}>
                        {paymentMethod === 'COD' && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button 
                      onClick={() => setStep(2)} 
                      className="py-3 px-6 border border-border/60 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors cursor-pointer"
                    >
                      ← Back to Summary
                    </button>
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center cursor-pointer"
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {loading ? 'Processing Order...' : `Pay & Complete Order (₹${finalTotalAmount.toLocaleString('en-IN')}) →`}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right Sticky Sidebar: Order Totals & Trust Badges */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            
            <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-lg font-playfair font-bold text-foreground border-b border-border/40 pb-4">
                Price Breakdown
              </h3>

              {/* Items Miniature Preview */}
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5 truncate max-w-50">
                      <div className="w-8 h-10 relative rounded bg-secondary overflow-hidden shrink-0">
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      </div>
                      <span className="truncate text-foreground font-medium">{item.name} <strong className="text-muted-foreground">x{item.quantity}</strong></span>
                    </div>
                    <span className="font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Calculation Rows */}
              <div className="space-y-3 text-xs pt-4 border-t border-border/40">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-foreground">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {totals?.discount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{totals.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Insured Express Shipping</span>
                  {totals ? (
                    totals.deliveryCharges === 0 ? (
                      <span className="text-emerald-500 font-bold uppercase tracking-wider">FREE</span>
                    ) : (
                      <span className="font-semibold text-foreground">₹{totals.deliveryCharges}</span>
                    )
                  ) : (
                    <span className="text-emerald-500 font-bold uppercase tracking-wider">FREE</span>
                  )}
                </div>
              </div>

              {/* Total Payable */}
              <div className="pt-4 border-t border-border/40 flex items-baseline justify-between">
                <div>
                  <span className="font-bold text-sm uppercase tracking-wider text-foreground block">Total Amount</span>
                  <span className="text-[10px] text-muted-foreground">Inclusive of all taxes</span>
                </div>
                <span className="text-2xl font-playfair font-black text-amber-500">
                  ₹{finalTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Brand Trust Badges */}
            <div className="bg-secondary/20 border border-border/40 rounded-3xl p-5 space-y-3">
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <span>100% Authentic Handcrafted Gold & Kundan Jewellery</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <Truck className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Insured Express Delivery with Real-time Tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <RotateCcw className="w-5 h-5 text-amber-500 shrink-0" />
                <span>2-Day Hassle-free Exchange & Return Guarantee</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
