"use client";

import { motion } from "framer-motion";

export default function CancellationPage() {
  return (
    <div className="min-h-screen pt-6 md:pt-8 pb-16 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Cancellation Policy</h1>
          <p className="text-muted-foreground font-light">Effective Date: 17/07/2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <p className="text-lg">
            At Radhika Jewellers, we understand that plans change. You can cancel orders subject to the conditions below.
          </p>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">1. Eligibility for Cancellation</h2>
            <p>
              Orders can be cancelled **only if they have not been packed or shipped**. Once the order status changes to any of the following, cancellation will no longer be available:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Packed</li>
              <li>Shipped</li>
              <li>Out for Delivery</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">2. How to Cancel your Order</h2>
            <p>
              To cancel an eligible order, go to your **Dashboard** or **Order History** page, select the order you wish to cancel, and click the "Cancel Order" button. 
            </p>
            <p>
              Alternatively, you can contact our support team immediately with your order ID at:
              <br />
              📧 Email: <a href="mailto:radhikajewellers699@gmail.com" className="font-semibold text-primary hover:underline">radhikajewellers699@gmail.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">3. Refund for Cancelled Orders</h2>
            <p>
              For prepaid orders that are cancelled successfully before shipping, the refund will be initiated to your original payment method (bank account, credit card, UPI, etc.) within **24–48 hours** and will reflect in your account within **5–7 business days** depending on your bank.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <h2 className="font-playfair text-xl text-foreground">Contact Us</h2>
            <p>
              If you have any questions or require assistance with cancelling an order, please reach out to us:
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
