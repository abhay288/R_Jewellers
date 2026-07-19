"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Heart } from "lucide-react";

// Placeholder data for trending products
export default function TrendingSlider({ products }: { products: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const displayProducts = products && products.length > 0 ? products : [];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayProducts.length - 1 : prevIndex - 1
    );
  };

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
              Trending <span className="text-gradient-gold italic font-normal">Now</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Discover our most sought-after pieces, loved by women who appreciate the finer things in life.
            </p>
          </div>
          <div className="hidden md:flex space-x-4 mt-6 md:mt-0">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Custom Slider Track */}
        <div className="relative w-full">
          <motion.div 
            className="flex gap-8"
            animate={{ x: `calc(-${currentIndex * 100}% - ${currentIndex * 2}rem)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: `${(displayProducts.length / 3) * 100}%` }}
          >
            {displayProducts.map((product) => (
              <div 
                key={product._id?.toString() || product.id}
                className="w-full md:w-1/3 shrink-0 group px-2"
              >
                {/* Image Container with Luxury Borders and Zoom */}
                <div className="relative h-[480px] bg-card border border-border/30 rounded-3xl overflow-hidden mb-6 shadow-xs group-hover:shadow-lg transition-all duration-700">
                  {/* Luxury badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="text-[8px] uppercase tracking-widest font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full backdrop-blur-xs">
                      {product.tag || "Limited Edition"}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <Image 
                      src={(product.images && product.images[0]) || (
                        product.name?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" :
                        product.name?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" :
                        product.name?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" :
                        product.name?.toLowerCase().includes('bangle') || product.name?.toLowerCase().includes('bracelet') ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" :
                        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
                      )} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw" 
                      className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-108" 
                    />
                  </div>
                  
                  {/* Subtle Gradient Shadow Overlay on Hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                  {/* Gold Shimmer Border Overlay */}
                  <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/45 rounded-3xl transition-all duration-700 pointer-events-none z-20 border-shimmer-gold" />

                  {/* Quick Action Overlay (Wishlist and Shopping Bag) */}
                  <div className="absolute inset-x-0 bottom-6 px-6 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-500 flex justify-center space-x-4 z-20">
                    <button className="w-11 h-11 bg-white dark:bg-black text-foreground border border-border/80 rounded-full flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-md cursor-pointer">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </button>
                    <button className="w-11 h-11 bg-white dark:bg-black text-foreground border border-border/80 rounded-full flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-md cursor-pointer">
                      <Heart className="w-4.5 h-4.5 group-hover:fill-primary/20 transition-colors" />
                    </button>
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <p className="text-[9px] uppercase tracking-widest text-primary font-medium mb-1.5">RADHIKA EDITORIAL</p>
                  <Link href={`/product/${product.slug || product._id}`} className="block">
                    <h3 className="font-playfair text-lg font-bold mb-1 hover:text-primary transition-colors text-ellipsis overflow-hidden whitespace-nowrap">{product.name}</h3>
                  </Link>
                  <p className="text-sm font-light text-muted-foreground text-shimmer-gold">₹{(product.finalPrice || product.price).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden justify-center space-x-4 mt-12">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
