"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/frontend/store/useCartStore";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={toggleCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-card shadow-2xl z-50 flex flex-col border-l border-border/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-playfair text-2xl font-bold">Your Cart</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                onClick={toggleCart}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                  <div>
                    <h3 className="font-playfair text-xl mb-2">Your cart is empty</h3>
                    <p className="text-sm text-muted-foreground">Looks like you haven't added anything yet.</p>
                  </div>
                  <button 
                    onClick={toggleCart}
                    className="border border-primary text-primary px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id} 
                    className="flex gap-4 border border-border/50 p-3 rounded-2xl bg-background/50"
                  >
                    <div className="relative w-24 h-24 bg-secondary/30 rounded-xl overflow-hidden shrink-0">
                      <Image 
                        src={item.image || (
                          item.name?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=400" :
                          item.name?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643477873-1ef912f71625?auto=format&fit=crop&q=80&w=400" :
                          item.name?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400" :
                          item.name?.toLowerCase().includes('bangle') || item.name?.toLowerCase().includes('bracelet') ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400" :
                          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                        )} 
                        alt={item.name} 
                        fill 
                        sizes="96px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-primary mb-1">{item.category}</p>
                          <h3 className="font-playfair font-medium text-sm line-clamp-1">{item.name}</h3>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="font-medium">₹{item.price.toFixed(2)}</p>
                        
                        <div className="flex items-center space-x-3 bg-secondary/30 rounded-full px-2 py-1 border border-border/50">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-foreground hover:text-primary transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-foreground hover:text-primary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border/50 bg-secondary/10">
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Link 
                  href="/checkout"
                  onClick={toggleCart}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  Proceed to Checkout
                </Link>
                <div className="mt-4 text-center">
                  <button onClick={toggleCart} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
