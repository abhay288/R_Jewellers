"use client";

import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Terms of Service</h1>
          <p className="text-muted-foreground font-light">Last Updated: July 2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="prose prose-stone dark:prose-invert max-w-none space-y-8 font-light leading-relaxed text-muted-foreground"
        >
          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">1. Introduction</h2>
            <p>
              Welcome to Radhika Jewellers. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Radhika Jewellers if you do not agree to take all of the terms and conditions stated on this page.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">2. Intellectual Property Rights</h2>
            <p>
              Other than the content you own, under these Terms, Radhika Jewellers and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">3. Restrictions</h2>
            <p>You are specifically restricted from all of the following:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Publishing any Website material in any other media</li>
              <li>Selling, sublicensing and/or otherwise commercializing any Website material</li>
              <li>Publicly performing and/or showing any Website material</li>
              <li>Using this Website in any way that is or may be damaging to this Website</li>
              <li>Using this Website in any way that impacts user access to this Website</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">4. Products and Pricing</h2>
            <p>
              All products listed on the website, their descriptions, and their prices are each subject to change. Radhika Jewellers reserves the right, at any time, to modify, suspend, or discontinue the sale of any product with or without notice.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl text-foreground mb-4">5. Governing Law & Jurisdiction</h2>
            <p>
              These Terms will be governed by and interpreted in accordance with the laws of the State/Country of our headquarters, and you submit to the non-exclusive jurisdiction of the state and federal courts located there for the resolution of any disputes.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
