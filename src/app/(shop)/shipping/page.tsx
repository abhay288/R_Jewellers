"use client";

import { motion } from "framer-motion";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Shipping Policy</h1>
          <p className="text-muted-foreground font-light">Last Updated: July 2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">1. Order Processing Time</h2>
            <p>
              All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">2. Shipping Rates & Delivery Estimates</h2>
            <p>
              Shipping charges for your order will be calculated and displayed at checkout. We offer the following shipping methods:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Standard Shipping:</strong> 3-5 business days (Free for orders over ₹200)</li>
              <li><strong>Express Shipping:</strong> 1-2 business days (₹25.00)</li>
              <li><strong>International Shipping:</strong> 7-14 business days (Calculated at checkout)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">3. Shipment Confirmation & Order Tracking</h2>
            <p>
              You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">4. Customs, Duties and Taxes</h2>
            <p>
              Radhika Jewellers is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
