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
        <h2 className="font-playfair text-[15vw] font-bold leading-none whitespace-nowrap">Legacy</h2>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Image Side */}
          <motion.div 
            className="flex-1 relative w-full h-[600px] lg:h-[800px] rounded-t-[50%] rounded-b-3xl overflow-hidden glass-card p-2"
            style={{ y, scale }}
          >
            <div className="absolute inset-0 bg-secondary/40 rounded-t-[50%] rounded-b-3xl m-2 overflow-hidden flex items-center justify-center">
               <span className="font-playfair text-2xl text-muted-foreground/30 animate-pulse">Brand Story Image</span>
            </div>
            {/* The real image goes here */}
            {/* <Image src="/images/brand-story.jpg" alt="Craftsmanship" fill className="object-cover rounded-t-[50%] rounded-b-3xl m-2" /> */}
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
                A Legacy of <br />
                <span className="text-gradient-gold italic font-normal">Craftsmanship</span>
              </h2>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg font-light">
                <p>
                  At Radhika Jewellers, we believe that true elegance transcends time. For generations, our artisans have dedicated themselves to the meticulous craft of creating artificial jewellery that rivals the brilliance of fine diamonds.
                </p>
                <p>
                  Every piece in our collection is a testament to our commitment to unparalleled quality, intricate detailing, and designs that celebrate the modern woman's grace while honoring traditional aesthetics.
                </p>
                <p>
                  We don't just create jewellery; we craft heirlooms that carry stories, emotions, and a legacy of unmatched beauty.
                </p>
              </div>

              <div className="mt-12">
                <Link 
                  href="/about"
                  className="inline-flex items-center justify-center border border-primary text-primary px-8 py-4 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-wider text-sm font-medium"
                >
                  Discover Our Story
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
