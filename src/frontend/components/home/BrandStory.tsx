"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BrandStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);

  return (
    <section ref={containerRef} className="py-32 relative overflow-hidden bg-card text-card-foreground">
      {/* Decorative background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-5">
        <h2 className="font-playfair text-[15vw] font-bold leading-none whitespace-nowrap">Royalty</h2>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Image Side */}
          <motion.div 
            className="flex-1 relative w-full h-150 lg:h-200 rounded-t-[50%] rounded-b-3xl overflow-hidden glass-card p-2"
            style={{ y, scale }}
          >
            <Image 
              src="/images/royal-curation.jpg" 
              alt="Curated Luxury Artificial Jewellery" 
              fill 
              className="object-cover rounded-t-[50%] rounded-b-3xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
          
          {/* Content Side */}
          <div className="flex-1 max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold leading-tight mb-8">
                Curated Luxury for <br />
                <span className="text-gradient-gold italic font-normal">Modern Royalty</span>
              </h2>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg font-light">
                <p>
                  At Radhika Jewellers, we believe that true elegance should be accessible to all. We curate high-fashion, luxury artificial jewellery that captures the splendour and intricate aesthetics of royal Indian heritage.
                </p>
                <p>
                  Every piece in our catalogue is handpicked for its superior finish, skin-safe hypoallergenic brass alloys, and sparkling simulated stones that catch the light from every angle.
                </p>
                <p>
                  We bring you ready-to-wear regal charm—giving you effortless opulence for festive celebrations, gala parties, and special occasions.
                </p>
              </div>

              <div className="mt-12 flex gap-4">
                <Link 
                  href="/shop"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full hover:opacity-90 transition-all duration-300 uppercase tracking-wider text-sm font-medium shadow-lg"
                >
                  Explore Catalogue
                </Link>
                <Link 
                  href="/about"
                  className="inline-flex items-center justify-center border border-primary text-primary px-8 py-4 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-wider text-sm font-medium"
                >
                  Our Story
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
