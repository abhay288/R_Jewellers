"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      {/* Hero Section */}
      <div className="container mx-auto px-6 mb-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-5xl md:text-6xl text-foreground mb-6"
        >
          Our Heritage
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto"
        >
          A legacy of unparalleled craftsmanship and timeless elegance, creating masterpieces that transcend generations.
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
            className="relative aspect-4/5 rounded-2xl overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1599643478514-4a82a0b12bc5?auto=format&fit=crop&q=80&w=1200"
              alt="Artisan crafting jewellery"
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
              Founded on the principles of purity and intricate design, Radhika Jewellers has been the purveyor of fine artificial jewellery for over three decades. Our journey began in a small artisan workshop, driven by a passion to make luxury accessible without compromising on the royal aesthetic.
            </p>
            <p className="text-muted-foreground leading-relaxed font-light">
              Every piece in our collection is a testament to the dedication of our master craftsmen. We source only the finest simulated diamonds, precious metals, and vibrant stones to ensure that every necklace, ring, and earring shines with authentic brilliance.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-secondary py-32">
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
