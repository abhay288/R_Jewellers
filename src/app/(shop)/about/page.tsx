"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Award, Heart } from "lucide-react";

export default function AboutPage() {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "Radhika Jewellers",
    "image": "https://images.unsplash.com/photo-1599643478514-4a82a0b12bc5?auto=format&fit=crop&q=80&w=1200",
    "@id": "https://radhika-jewellers.vercel.app/#store",
    "url": "https://radhika-jewellers.vercel.app",
    "telephone": "+91-9988776655",
    "priceRange": "$$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "102, Palace Road",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "302001",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "19:00"
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-6 mb-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-5xl md:text-6xl text-foreground mb-6"
        >
          Our Legacy & Trust
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto"
        >
          A heritage of unparalleled craftsmanship, certified gold plating, and ethical sourcing, creating timeless jewelry that transcends generations.
        </motion.p>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1599643478514-4a82a0b12bc5?auto=format&fit=crop&q=80&w=1200"
              alt="Artisan crafting jewellery at Radhika Jewellers"
              fill
              className="object-cover"
              unoptimized={true}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="font-playfair text-4xl text-foreground">The Art of Perfection</h2>
            <p className="text-muted-foreground leading-relaxed font-light">
              Founded on the principles of purity and intricate design, Radhika Jewellers has been the purveyor of fine artificial jewelry for over three decades. Our journey began in a Jaipur artisan workshop, driven by a passion to make luxury accessible without compromising on the royal aesthetic of Indian heritage.
            </p>
            <p className="text-muted-foreground leading-relaxed font-light">
              Every single piece in our collection is a testament to the dedication of our master craftsmen. We use skin-safe hypoallergenic alloys, authentic Kundan setting techniques, and lab-certified semi-precious gems to ensure each creation meets international luxury standards.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quality Standards & Certifications (EEAT) */}
      <div className="container mx-auto px-6 mb-32">
        <h2 className="font-playfair text-4xl text-center text-foreground mb-16">Certified Quality Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-2xl bg-secondary/35 border border-border/50 space-y-4">
            <Award className="w-8 h-8 text-primary" />
            <h3 className="font-playfair text-xl font-bold">100% Certified Materials</h3>
            <p className="text-muted-foreground text-sm font-light">
              Our 22K gold-plated layers, sterling silver coatings, and gemstones undergo rigorous thickness and quality validation testing to ensure lifetime durability.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-secondary/35 border border-border/50 space-y-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h3 className="font-playfair text-xl font-bold">Hypoallergenic & Eco-Friendly</h3>
            <p className="text-muted-foreground text-sm font-light">
              All metal alloys used at Radhika Jewellers are strictly lead-free, nickel-free, and cadmium-free, ensuring complete safety and comfort for sensitive skin.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-secondary/35 border border-border/50 space-y-4">
            <Heart className="w-8 h-8 text-primary" />
            <h3 className="font-playfair text-xl font-bold">Ethically Handcrafted</h3>
            <p className="text-muted-foreground text-sm font-light">
              We directly support local artisan guilds in Rajasthan, securing fair-trade wages and helping preserve ancient heritage jewelry design traditions.
            </p>
          </div>
        </div>
      </div>

      {/* Meet our Experts (EEAT) */}
      <div className="container mx-auto px-6 mb-32">
        <h2 className="font-playfair text-4xl text-center text-foreground mb-16">Meet Our Master Curators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="relative w-40 h-40 rounded-full overflow-hidden mx-auto border-2 border-primary">
              <Image
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
                alt="Radhika Sen - Founder & Head Designer"
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold">Radhika Sen</h3>
              <p className="text-xs text-primary uppercase tracking-wider font-semibold">Founder & Head Designer</p>
            </div>
            <p className="text-muted-foreground text-sm font-light max-w-xs mx-auto leading-relaxed">
              With a degree in Gemology and over 15 years in luxury design, Radhika oversees the selection and styling of every single collection.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="relative w-40 h-40 rounded-full overflow-hidden mx-auto border-2 border-primary">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                alt="Devendra Prasad - Chief Goldsmith"
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <div>
              <h3 className="font-playfair text-lg font-bold">Devendra Prasad</h3>
              <p className="text-xs text-primary uppercase tracking-wider font-semibold">Chief Goldsmith</p>
            </div>
            <p className="text-muted-foreground text-sm font-light max-w-xs mx-auto leading-relaxed">
              Devendra leads our Jaipur workshop with 28 years of jewelry smithing expertise, ensuring flawless Kundan, Meenakari, and stone-setting.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-secondary/40 py-24 border-t border-border/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-playfair text-4xl text-foreground mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="font-playfair text-2xl text-foreground">Craftsmanship</h3>
              <p className="text-muted-foreground font-light text-sm">Meticulous attention to detail in every curve and setting.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="font-playfair text-2xl text-foreground">Integrity</h3>
              <p className="text-muted-foreground font-light text-sm">Transparent practices and uncompromising quality standards.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="font-playfair text-2xl text-foreground">Elegance</h3>
              <p className="text-muted-foreground font-light text-sm">Designs that evoke a sense of royal sophistication and grace.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
