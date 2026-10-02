"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-6 md:pt-8 pb-16 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Terms & Conditions</h1>
          <p className="text-muted-foreground font-light">Effective Date: 17/07/2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <p>
            Welcome to Radhika Jewellers. By accessing or using our website, you agree to these Terms & Conditions. If you do not agree, please do not use our website.
          </p>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">1. Eligibility</h2>
            <p>
              You must be at least 18 years old or use this website under the supervision of a parent or guardian.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">2. Products</h2>
            <p>
              We sell **Artificial Jewellery** only. Product images are for reference. Slight variations in color or design may occur due to lighting and screen settings. All product availability depends on stock.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">3. Pricing</h2>
            <p>
              All prices are in **Indian Rupees (₹)**. Prices may change without prior notice. Shipping charges are calculated during checkout.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">4. Orders</h2>
            <p>
              Orders are confirmed only after successful placement. We reserve the right to cancel orders due to stock issues, incorrect pricing, or suspected fraudulent activity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">5. Payment</h2>
            <p>
              Currently, we accept Cash on Delivery (COD) and secure online payment methods via Razorpay. Online payment methods may be updated in the future.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">6. Returns</h2>
            <p>
              Returns are accepted only within 2 days of delivery. Products must be unused and in their original condition. Refunds are processed only after inspection of the returned product.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">7. Intellectual Property</h2>
            <p>
              All logos, designs, images, and content on this website are the property of Radhika Jewellers and may not be copied, modified, or distributed without explicit written permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">8. Limitation of Liability</h2>
            <p>
              Radhika Jewellers is not responsible for indirect, incidental, or consequential damages arising from the use of this website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">9. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of India.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <h2 className="font-playfair text-xl text-foreground">Contact Us</h2>
            <p>
              If you have any questions regarding these Terms & Conditions, please contact us:
            </p>
            <ul className="list-none space-y-2 text-sm">
              <li>📧 Email: <a href="mailto:radhikajewellers699@gmail.com" className="font-semibold text-primary hover:underline">radhikajewellers699@gmail.com</a></li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
