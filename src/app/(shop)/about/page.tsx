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

  const craftsmanshipSteps = [
    {
      step: "01",
      title: "Royal Motif Blueprint",
      description: "Every piece begins with intricate design sketches inspired by authentic Mughal, Rajputana, and South Indian temple jewellery archives."
    },
    {
      step: "02",
      title: "Hypoallergenic Casting",
      description: "Precision molding using skin-safe brass alloy strictly compliant with international lead-free, nickel-free, and cadmium-free standards."
    },
    {
      step: "03",
      title: "Precision Gem Setting",
      description: "4th-generation Jaipur artisans carefully set every individual Kundan stone, CZ diamond, and semi-precious gem using traditional silver foil backings."
    },
    {
      step: "04",
      title: "Triple 22K Gold Vacuum Plating",
      description: "Coated with a multi-layered 22-carat gold micro-finish to deliver brilliant royal luster that resists tarnish, humidity, and daily wear."
    },
    {
      step: "05",
      title: "Microscopic Quality Audit",
      description: "100% manual inspection under magnification to guarantee zero loose stones, perfect symmetry, and flawless clasp mechanism durability."
    }
  ];

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
          Heritage • Elegance • Authenticity
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight"
        >
          Crafting Royal Heritage for Generations
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto"
        >
          For over three decades, Radhika Jewellers has redefined luxury artificial jewellery. We blend ancient royal Indian craftsmanship with modern skin-safe metallurgy to deliver timeless elegance for every special occasion.
        </motion.p>
      </div>

      {/* Stats Bar Counter */}
      <div className="container mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-secondary/40 border border-border/50 rounded-3xl p-8 text-center shadow-lg">
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">30+</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Years of Legacy</p>
          </div>
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">50,000+</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Happy Customers</p>
          </div>
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">120+</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Master Artisans</p>
          </div>
          <div>
            <p className="font-playfair text-3xl md:text-4xl font-bold text-amber-500 mb-1">100%</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Certified Quality</p>
          </div>
        </div>
      </div>

      {/* The Art of Perfection Story Section */}
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
              src="/images/artisan-perfection.png"
              alt="Master artisan crafting luxury Kundan jewellery at Radhika Jewellers"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
              <div className="text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  Master Craftsmanship
                </span>
                <p className="font-playfair text-xl font-bold">Finely Crafted by Master Artisans in Rajasthan & Bengal</p>
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
              Our Journey & Philosophy
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              The Art of Perfection
            </h2>

            <p className="text-muted-foreground leading-relaxed font-light text-sm sm:text-base">
              Founded on the unyielding principles of purity, precision, and intricate artistry, Radhika Jewellers began as a humble artisan guild in Rajasthan. Our vision was clear: to democratize royal Indian luxury, allowing women across the world to wear magnificent bridal and festive jewellery without exorbitant gold bullion costs.
            </p>

            <p className="text-muted-foreground leading-relaxed font-light text-sm sm:text-base">
              Every creation is designed with care. We employ traditional <strong className="text-foreground font-semibold">Jaipuri Kundan setting</strong>, detailed <strong className="text-foreground font-semibold">Meenakari enameling</strong>, and multi-layered 22-carat gold vacuum plating. By fusing time-tested heritage aesthetics with modern skin-safe metallurgy, our pieces retain their radiant golden luster for years.
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

      {/* 5-Stage Craftsmanship Process Section */}
      <div className="bg-secondary/30 py-24 border-y border-border/40 mb-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500 font-playfair block mb-2">
              Uncompromising Quality
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground">
              Our 5-Stage Craftsmanship Process
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-light mt-3">
              How we transform raw alloys and gemstones into timeless royal heirlooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {craftsmanshipSteps.map((stepItem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card border border-border/50 rounded-3xl p-6 relative hover:border-amber-500/50 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-playfair font-bold text-amber-500/40 block mb-3">
                    {stepItem.step}
                  </span>
                  <h3 className="font-playfair text-base font-bold text-foreground mb-2">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Standards & Certifications */}
      <div className="container mx-auto px-6 mb-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground">
            Certified Quality Standards
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-light mt-2">
            Built on integrity, certified materials, and ethical fair-trade artisan support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4 hover:border-amber-500/40 transition-all shadow-sm">
            <Award className="w-8 h-8 text-amber-500" />
            <h3 className="font-playfair text-xl font-bold text-foreground">100% Certified Materials</h3>
            <p className="text-muted-foreground text-xs font-light leading-relaxed">
              Our 22K gold-plated layers, sterling silver coatings, and semi-precious gemstones undergo rigorous thickness and quality validation testing to ensure lifetime durability.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4 hover:border-amber-500/40 transition-all shadow-sm">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <h3 className="font-playfair text-xl font-bold text-foreground">Hypoallergenic & Eco-Friendly</h3>
            <p className="text-muted-foreground text-xs font-light leading-relaxed">
              All metal alloys used at Radhika Jewellers are strictly lead-free, nickel-free, and cadmium-free, ensuring complete safety and comfort even for the most sensitive skin types.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 space-y-4 hover:border-amber-500/40 transition-all shadow-sm">
            <Heart className="w-8 h-8 text-amber-500" />
            <h3 className="font-playfair text-xl font-bold text-foreground">Ethically Sourced & Crafted</h3>
            <p className="text-muted-foreground text-xs font-light leading-relaxed">
              We directly support over 120 artisan families across Rajasthan and Bengal, securing fair-trade wages and helping preserve centuries-old Indian jewelry heritage traditions.
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
            &quot;Our mission has always been to make every woman feel like royalty on her special day. We don&apos;t just sell jewellery; we preserve royal heritage and create memories that last forever.&quot;
          </blockquote>
          
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500">
            — Founder, Radhika Jewellers
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-6 text-center">
        <div className="bg-secondary/40 border border-border/50 rounded-3xl p-12 max-w-3xl mx-auto space-y-6">
          <h2 className="font-playfair text-3xl font-bold text-foreground">Explore Our Royal Catalogue</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-light max-w-md mx-auto">
            Discover exquisite Kundan necklaces, bridal sets, drop earrings, and royal bangles crafted for your memorable moments.
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
