"use client";

import { motion } from "framer-motion";

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen pt-6 md:pt-8 pb-16 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Return & Refund Policy</h1>
          <p className="text-muted-foreground font-light">Effective Date: 17/07/2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <p className="text-lg">
            We offer a **2-Day Return Policy** on products purchased from Radhika Jewellers.
          </p>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">1. Eligible Returns</h2>
            <p>Returns are accepted only if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Wrong product was delivered.</li>
              <li>Damaged product was received.</li>
              <li>Product has a manufacturing defect.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">2. Non-Eligible Returns</h2>
            <p>Returns are not accepted if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product is used or tag is removed.</li>
              <li>Product is damaged by the customer.</li>
              <li>Return requested after 2 days of delivery.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">3. Refund Process</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Submit a return request via our support portal or email.</li>
              <li>Enter/provide your UPI ID for the refund.</li>
              <li>Our team reviews the request and inspects the details.</li>
              <li>Product pickup is arranged for eligible cases.</li>
              <li>Returned product is inspected at our warehouse.</li>
              <li>Refund is processed directly to the provided UPI ID.</li>
            </ol>
            <p className="mt-4">
              Refund processing may take **5–7 business days** after approval.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <h2 className="font-playfair text-xl text-foreground">Contact Us</h2>
            <p>
              If you have any questions regarding our return and refund policy, please reach out to us:
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
