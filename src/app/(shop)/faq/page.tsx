"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const faqs = [
  {
    question: "Are your diamonds real?",
    answer: "We use the highest grade of simulated diamonds and cubic zirconia, crafted to mimic the exact brilliance and clarity of real diamonds. Our pieces offer the luxurious look of fine jewellery without the exorbitant price tag."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship globally! Shipping costs and delivery times vary depending on the destination. You can see the exact shipping options at checkout."
  },
  {
    question: "How do I care for my artificial jewellery?",
    answer: "To maintain the brilliance of your pieces, avoid direct contact with perfumes, lotions, and water. Store them in a cool, dry place, preferably in the original Radhika Jewellers pouch or a soft-lined box."
  },
  {
    question: "Can I customize a piece of jewellery?",
    answer: "We offer limited customization services for select collections. Please reach out to our design team through the Contact Us page with your request, and we will do our best to accommodate it."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for unworn items in their original condition and packaging. Please visit our Returns & Exchanges page for more detailed information."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Build JSON-LD FAQ Schema
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen pt-6 md:pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-6">Frequently Asked Questions</h1>
          <p className="text-muted-foreground font-light">Find answers to the most common questions about our products and services.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-border/50 rounded-2xl overflow-hidden bg-secondary/30"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                    openIndex === index ? "rotate-180" : ""
                  )} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 text-muted-foreground font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
