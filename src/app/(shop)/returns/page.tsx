"use client";

import { motion } from "framer-motion";

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Returns & Exchanges</h1>
          <p className="text-muted-foreground font-light">Last Updated: July 2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">1. Return Policy Overview</h2>
            <p>
              We want you to be completely satisfied with your purchase. If for any reason you are not, we gladly accept returns of unworn, unwashed, undamaged or defective merchandise purchased online within 30 days of the original purchase date.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">2. Conditions for Return</h2>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Items must be returned within 30 days of receipt.</li>
              <li>Items must be in original condition, unworn, and with all tags attached.</li>
              <li>Customized or engraved items are non-returnable unless defective.</li>
              <li>Original packaging must be intact.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">3. How to Initiate a Return</h2>
            <p>
              To initiate a return, please contact our customer service team at <strong>support@radhikajewellers.com</strong> with your order number and reason for return. We will provide you with a return authorization number and shipping instructions.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">4. Refunds</h2>
            <p>
              Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment within 5-7 business days.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
