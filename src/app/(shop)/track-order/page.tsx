"use client";

import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen pt-6 md:pt-8 pb-16">
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-4">Track Your Order</h1>
          <p className="text-muted-foreground font-light">
            Enter your order number and email address below to track your delivery status.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-secondary/50 p-8 md:p-10 rounded-3xl border border-border/50"
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="orderId" className="text-sm font-medium tracking-wide">Order Number</label>
              <input 
                type="text" 
                id="orderId" 
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. ORD-12345678"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium tracking-wide">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter the email used for purchase"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground font-medium tracking-wider uppercase py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Track Package
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
