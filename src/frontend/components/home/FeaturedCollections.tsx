"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeaturedCollections({ collections }: { collections: any[] }) {
  // If no dynamic collections are passed, use fallbacks or an empty array.
  const displayCollections = collections && collections.length > 0 ? collections : [];
  
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
              Curated <span className="text-gradient-gold italic font-normal">Collections</span>
            </h2>
            <p className="text-muted-foreground">
              Explore our meticulously handcrafted collections designed to bring out your inner radiance for every occasion.
            </p>
          </div>
          <Link href="/collections" className="group hidden md:inline-flex items-center text-sm font-medium tracking-wider uppercase hover:text-primary transition-colors">
            View All Collections
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCollections.map((collection, index) => (
            <motion.div
              key={collection._id?.toString() || collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <Link href={`/shop?category=${collection.slug}`} className="block relative h-[450px] rounded-3xl overflow-hidden mb-6 bg-secondary/30">
                {/* Placeholder Image container */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image 
                    src={collection.icon || (
                      collection.slug?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" :
                      collection.slug?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" :
                      collection.slug?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" :
                      collection.slug?.toLowerCase().includes('bangle') || collection.slug?.toLowerCase().includes('bracelet') ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" :
                      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                    )} 
                    alt={collection.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-8 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-playfair text-white mb-2">{collection.name}</h3>
                  <div className="w-12 h-px bg-primary mb-4 transition-all duration-500 group-hover:w-full" />
                  <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {collection.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/collections" className="group inline-flex items-center text-sm font-medium tracking-wider uppercase hover:text-primary transition-colors">
            View All Collections
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
