"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Award, Heart, Sparkles, CheckCircle2, Users, Layers, Gem } from "lucide-react";

export default function AboutPage() {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "Radhika Jewellers",
    "image": "https://www.radhikajewellers.store/og-image.jpg",
    "@id": "https://www.radhikajewellers.store/#store",
    "url": "https://www.radhikajewellers.store",
    "priceRange": "₹₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "51 Khagendra Nath Ganguly Lane, 4th Floor/Flat No 402, Nandi Bagan",
      "addressLocality": "Howrah",
      "addressRegion": "West Bengal",
      "postalCode": "711106",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "10:00",
      "closes": "19:00"
    }
  };


  return (
    <div className="min-h-screen bg-background pt-6 md:pt-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-6 mb-20 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500 font-playfair block mb-3"
        >
          Luxury • Elegance • Modern Royalty
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight"
        >
          Royal Indian Elegance, Redefined
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto"
        >
          At Radhika Jewellers, we bring you meticulously curated luxury artificial jewellery. Inspired by timeless Indian royalty and engineered with modern skin-safe metallurgy, our collections deliver regal glamour for every festive celebration and special occasion.
        </motion.p>
      </div>

      {/* Stats Bar Counter */}
      <div className="container mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-secondary/40 border border-border/50 rounded-3xl p-8 text-center shadow-lg">
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">5,000+</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Curated Designs</p>
          </div>
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">100%</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Skin-Safe Alloys</p>
          </div>
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">22K</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Micro-Gold Polish</p>
          </div>
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">Pan-India</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Express Delivery</p>
          </div>
        </div>
      </div>

      {/* Royal Elegance Story Section */}
      <div className="container mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Image Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 group"
          >
            <Image
              src="/images/royal-curation.jpg"
              alt="Curated luxury Kundan choker necklace and artificial jewellery collection at Radhika Jewellers"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
              <div className="text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  Curated Elegance
                </span>
                <p className="font-playfair text-xl font-bold">Exquisite Royal Kundan, Polki & CZ Collections</p>
              </div>
            </div>
          </motion.div>
          
          {/* Story Narrative Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500 font-playfair">
              Our Vision & Standards
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Luxury Artificial Jewellery for Modern Royalty
            </h2>

            <p className="text-muted-foreground leading-relaxed font-light text-sm sm:text-base">
              Radhika Jewellers was founded with a singular mission: to bring the grandeur and majestic beauty of royal Indian jewellery to modern women without the prohibitive cost of gold bullion. We believe true elegance should be accessible, empowering, and effortless.
            </p>

            <p className="text-muted-foreground leading-relaxed font-light text-sm sm:text-base">
              We carefully select and curate the finest ready-to-wear artificial jewellery—from regal Jaipuri Kundan and uncut Polki to sparkling American Diamond (CZ) and festive temple sets. Every piece is vetted for brilliant stone luster, durable settings, and multi-layered 22-carat gold micro-polish that retains its radiant glow.
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3.5 bg-secondary/30 border border-border/40 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Royal Aesthetic</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Authentic museum-grade designs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3.5 bg-secondary/30 border border-border/40 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Skin Safe Alloys</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">100% Lead & Nickel free coating.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


      {/* Quality Standards & Certifications */}
      <div className="container mx-auto px-6 mb-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground">
            Our Quality Promise
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-light mt-2">
            Built on uncompromising quality, skin-safe materials, and honest curation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4 hover:border-amber-500/40 transition-all shadow-sm">
            <Award className="w-8 h-8 text-amber-500" />
            <h3 className="font-playfair text-xl font-bold text-foreground">Premium 22K Micro-Gold Finish</h3>
            <p className="text-muted-foreground text-xs font-light leading-relaxed">
              Our 22K gold-plated micro-finish and high-grade simulated gemstones undergo rigorous surface testing to ensure long-lasting luster and tarnish resistance.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4 hover:border-amber-500/40 transition-all shadow-sm">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <h3 className="font-playfair text-xl font-bold text-foreground">Hypoallergenic & Skin-Safe</h3>
            <p className="text-muted-foreground text-xs font-light leading-relaxed">
              All metal alloys used at Radhika Jewellers are strictly lead-free, nickel-free, and cadmium-free, ensuring complete safety and comfort even for the most sensitive skin types.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4 hover:border-amber-500/40 transition-all shadow-sm">
            <Heart className="w-8 h-8 text-amber-500" />
            <h3 className="font-playfair text-xl font-bold text-foreground">Handpicked Designer Curation</h3>
            <p className="text-muted-foreground text-xs font-light leading-relaxed">
              We inspect each jewellery piece before dispatch to ensure immaculate stone settings, durable clasp mechanisms, and magnificent royal aesthetics.
            </p>
          </div>
        </div>
      </div>

      {/* Founder's Vision Quote Banner */}
      <div className="container mx-auto px-6 mb-24">
        <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl relative overflow-hidden">
          <Sparkles className="w-8 h-8 text-amber-500/30 absolute top-4 left-4" />
          <Sparkles className="w-8 h-8 text-amber-500/30 absolute bottom-4 right-4" />
          
          <blockquote className="font-playfair text-lg sm:text-2xl text-foreground font-medium italic leading-relaxed mb-6">
            &quot;Our mission is to make every woman feel like royalty at her celebrations. We curate magnificent, skin-friendly artificial jewellery so you can shine with timeless elegance without compromise.&quot;
          </blockquote>
          
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500">
            — Radhika Jewellers
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-6 text-center">
        <div className="bg-secondary/40 border border-border/50 rounded-3xl p-12 max-w-3xl mx-auto space-y-6">
          <h2 className="font-playfair text-3xl font-bold text-foreground">Explore Our Royal Catalogue</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-light max-w-md mx-auto">
            Discover exquisite Kundan necklaces, festive sets, drop earrings, and royal bangles curated for your memorable moments.
          </p>
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-amber-400 transition-all shadow-lg"
            >
              Shop All Products →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
