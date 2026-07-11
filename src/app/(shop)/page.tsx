"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import BrandStory from "@/components/home/BrandStory";
import TrendingSlider from "@/components/home/TrendingSlider";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { FloatingJewel } from "@/components/3d/FloatingJewel";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="flex flex-col min-h-screen bg-background" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Abstract luxury shapes/glows */}
        <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-64 w-[800px] h-[600px] bg-secondary/30 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          {/* Hero Content */}
          <motion.div 
            className="flex-1 text-center md:text-left pt-20 md:pt-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            style={{ y: y2 }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="inline-flex items-center space-x-2 bg-secondary/50 backdrop-blur-sm border border-primary/20 px-4 py-2 rounded-full mb-8"
            >
              <Star className="text-primary w-4 h-4 fill-primary" />
              <span className="text-xs uppercase tracking-widest font-medium">New Bridal Collection 2026</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold leading-[1.1] mb-6">
              Elegance <br />
              <span className="text-gradient-gold italic font-normal">Redefined</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">
              Discover the epitome of luxury with our handcrafted artificial jewellery. Adorn yourself in brilliance that lasts forever.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                href="/shop" 
                className="group relative inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative text-sm font-medium tracking-wider uppercase">Shop Collection</span>
              </Link>
              <Link 
                href="/collections" 
                className="group inline-flex items-center text-sm font-medium tracking-wider uppercase hover:text-primary transition-colors"
              >
                View Lookbook
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
          
          {/* Hero Imagery */}
          <motion.div 
            className="flex-1 relative hidden md:block h-[600px] w-full"
            style={{ y: y1, opacity }}
          >
            {/* The 3D Floating Jewel */}
            <div className="absolute inset-0 rounded-4xl transform rotate-3">
              <div className="absolute inset-0 bg-background rounded-4xl overflow-hidden flex items-center justify-center">
                 <FloatingJewel />
              </div>
            </div>
            {/* Decorative Floating Element */}
            <motion.div 
              className="absolute -bottom-10 -left-10 glass-card p-6 rounded-2xl w-64 shadow-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Star className="text-white fill-white w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Finest Quality</p>
                  <p className="text-xs text-muted-foreground">Handcrafted designs</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ScrollReveal direction="up" delay={0.2} duration={1}>
        <FeaturedCollections />
      </ScrollReveal>
      
      <ScrollReveal direction="none" delay={0.1} duration={1.5}>
        <BrandStory />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.2} duration={1}>
        <TrendingSlider />
      </ScrollReveal>
    </div>
  );
}
