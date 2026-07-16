"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground font-light">Effective Date: 17/07/2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <p>
            At Radhika Jewellers, we value your privacy and are committed to protecting your personal data.
          </p>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">1. Information We Collect</h2>
            <p>We collect and process the following information when you interact with our storefront:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact details</li>
              <li>Email Address and Mobile Number</li>
              <li>Shipping and Billing Address</li>
              <li>Order details and transaction history</li>
              <li>IP Address and browser/device metadata</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">2. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process your transactions and manage orders</li>
              <li>Deliver products and coordinate shipments</li>
              <li>Provide customer support and resolve disputes</li>
              <li>Send real-time order status updates and notifications</li>
              <li>Prevent fraudulent activity and secure our systems</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">3. Cookies and Tracking Technologies</h2>
            <p>We use cookies and equivalent tracking systems to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep you logged in across sessions</li>
              <li>Remember items added to your shopping cart</li>
              <li>Analyze web traffic and optimize performance</li>
              <li>Store user preferences</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">4. Data Security</h2>
            <p>
              We implement industry-standard physical, electronic, and administrative security measures to safeguard your information. Please note that while we take strict measures, no system is completely secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">5. Third-Party Services</h2>
            <p>We share necessary information with trusted third-party providers to facilitate operations, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>**Shiprocket** (Shipping and delivery tracking)</li>
              <li>**Cloudinary** (Secure product asset storage)</li>
              <li>**MongoDB Atlas** (Encrypted database services)</li>
              <li>**Firebase Cloud Messaging** (Push notifications)</li>
              <li>**Google Analytics** (Traffic analytics)</li>
            </ul>
            <p className="mt-4">
              We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-playfair text-2xl text-foreground">6. Your Rights</h2>
            <p>You have the right to access your personal data, request corrections, or request deletion of your account and personal information. To exercise these rights, please contact support.</p>
          </section>

          <section className="space-y-4 pt-6 border-t border-border">
            <h2 className="font-playfair text-xl text-foreground">Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact us:
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
