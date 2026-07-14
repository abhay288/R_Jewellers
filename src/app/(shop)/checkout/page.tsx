"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, CreditCard, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/frontend/store/useCartStore";

export default function CheckoutPage() {
  const { items } = useCartStore();
  const [step, setStep] = useState(1);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 15.00;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="container mx-auto px-6">
        
        <div className="flex items-center space-x-4 mb-8 text-sm font-medium">
          <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Shop
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Left: Checkout Flow */}
          <div className="w-full lg:w-2/3">
            <h1 className="text-4xl font-playfair font-bold mb-8">Secure Checkout</h1>
            
            {/* Steps Progress */}
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-border/50 z-0" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  1
                </div>
                <span className={`text-xs mt-2 uppercase tracking-wider font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>Shipping</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  2
                </div>
                <span className={`text-xs mt-2 uppercase tracking-wider font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>Payment</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  3
                </div>
                <span className={`text-xs mt-2 uppercase tracking-wider font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>Review</span>
              </div>
            </div>

            {/* Forms */}
            <div className="bg-card border border-border/50 p-8 rounded-3xl shadow-sm">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="text-2xl font-playfair font-bold mb-6">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="Radhika" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="Sharma" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="123 Luxury Avenue, Suite 400" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="New York" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                      <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="10001" />
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
                  >
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-playfair font-bold">Payment Details</h2>
                    <div className="flex items-center text-primary text-sm font-medium space-x-1">
                      <Lock className="w-4 h-4" />
                      <span>Encrypted</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    <div className="flex items-center p-4 border border-primary bg-primary/5 rounded-xl cursor-pointer">
                      <div className="w-4 h-4 rounded-full border-4 border-primary bg-background mr-4" />
                      <CreditCard className="w-5 h-5 text-primary mr-3" />
                      <span className="font-medium">Credit / Debit Card</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border/50 rounded-xl bg-background/50">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Card Number</label>
                        <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                        <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">CVC</label>
                        <input type="text" className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono" placeholder="123" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => setStep(1)}
                      className="text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
                    >
                      Review Order
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="text-2xl font-playfair font-bold mb-6">Review Your Order</h2>
                  
                  <div className="p-6 border border-border/50 rounded-xl bg-background/50 mb-8 space-y-4">
                    <div className="flex justify-between items-start border-b border-border/50 pb-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Shipping To</h4>
                        <p className="font-medium">Radhika Sharma</p>
                        <p className="text-muted-foreground text-sm">123 Luxury Avenue, Suite 400<br/>New York, 10001</p>
                      </div>
                      <button onClick={() => setStep(1)} className="text-xs font-medium uppercase text-primary tracking-wider hover:underline">Edit</button>
                    </div>
                    
                    <div className="flex justify-between items-start pt-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Payment Method</h4>
                        <p className="font-medium flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span>Ending in 4242</span>
                        </p>
                      </div>
                      <button onClick={() => setStep(2)} className="text-xs font-medium uppercase text-primary tracking-wider hover:underline">Edit</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => setStep(2)}
                      className="text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Place Order</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-secondary/20 border border-border/50 p-8 rounded-3xl sticky top-32">
              <h3 className="text-2xl font-playfair font-bold mb-6 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span>Order Summary</span>
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">Your cart is empty.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        <span className="text-[8px] uppercase text-muted-foreground/50">Img</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-playfair text-sm font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="border-t border-border/50 pt-6 space-y-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>₹${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-primary">₹${items.length > 0 ? total.toFixed(2) : "0.00"}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Secure, encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
