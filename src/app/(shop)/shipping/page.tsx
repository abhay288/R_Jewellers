"use client";

import { motion } from "framer-motion";

export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Shipping & Delivery Policy</h1>
          <p className="text-muted-foreground font-light">Effective Date: 17/07/2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <p className="text-lg">
            At Radhika Jewellers, we strive to deliver your orders safely and efficiently.
          </p>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">1. Processing Timeline</h2>
            <p>
              All orders are processed and packed within **1–2 business days** of successful placement. You will receive an email and notification as soon as your order has been packed and handed over to our shipping partner.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">2. Delivery Estimates</h2>
            <p>
              Delivery timelines vary depending on your location and the shipping partner. Generally, orders are delivered within:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Metro Cities: **2–4 business days**</li>
              <li>Rest of India: **4–7 business days**</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">3. Shipping Charges</h2>
            <p>
              Shipping charges are dynamically calculated and displayed clearly on the checkout page before payment. Special offers or orders above a certain threshold may qualify for free shipping.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">4. Shipment Tracking</h2>
            <p>
              Once your package is dispatched, we will provide you with tracking information via email and SMS/notifications. You can track your shipment status in real-time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">5. Force Majeure & Delays</h2>
            <p>
              Delivery delays due to natural disasters, government regulations, strikes, or unforeseen logistics issues are beyond our control. In such events, our team will work with shipping partners to resolve the delay as soon as possible.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <h2 className="font-playfair text-xl text-foreground">Contact Us</h2>
            <p>
              If you have any questions or have not received your delivery within the expected timeline, please reach out to us:
            </p>
            <ul className="list-none space-y-2 text-sm">
              <li>📧 Email: **support@radhikajewellers.com**</li>
              <li>📞 Phone: **+91 98765 43210**</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
