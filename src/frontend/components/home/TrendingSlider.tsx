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
                className="w-full md:w-1/3 shrink-0 group"
              >
                <div className="relative h-[450px] bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {product.images && product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw" className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <span className="font-playfair text-xl text-muted-foreground/30 animate-pulse">Product Image</span>
                    )}
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex justify-center space-x-4 bg-linear-to-t from-black/50 to-transparent">
                    <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  {/* We might need to resolve category name later, or just pass slug */}
                  <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">Jewellery</p>
                  <Link href={`/product/${product.slug || product._id}`} className="block">
                    <h3 className="font-playfair text-xl font-medium mb-2 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-muted-foreground">₹{product.finalPrice || product.price}</p>
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
