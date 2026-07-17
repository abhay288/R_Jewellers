"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    id: "bridal-2026",
    title: "Bridal Collection",
    description: "Exquisite pieces crafted for your special day.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    href: "/shop?collection=bridal",
  },
  {
    id: "everyday-elegance",
    title: "Everyday Elegance",
    description: "Subtle luxury for your daily wardrobe.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    href: "/shop?collection=everyday",
  },
  {
    id: "festival-glow",
    title: "Festival Glow",
    description: "Vibrant designs celebrating joy and tradition.",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800",
    href: "/shop?collection=festival",
  },
  {
    id: "heritage-classics",
    title: "Heritage Classics",
    description: "Timeless designs inspired by royal archives.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    href: "/shop?collection=heritage",
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-playfair text-5xl md:text-6xl text-foreground mb-6"
          >
            Curated Collections
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-muted-foreground font-light leading-relaxed"
          >
            Discover our meticulously crafted themes, where every piece tells a unique story of elegance and artistry.
          </motion.p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {collections.map((collection, index) => (
            <motion.div 
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-secondary aspect-4/5 sm:aspect-square md:aspect-4/5 cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${collection.image})` }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <h2 className="font-playfair text-3xl mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {collection.title}
                </h2>
                <p className="text-white/80 font-light mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  {collection.description}
                </p>
                <Link 
                  href={collection.href} 
                  className="inline-flex items-center text-sm font-medium tracking-wider uppercase hover:text-primary transition-colors opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 duration-500 delay-200"
                >
                  Explore Collection <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
