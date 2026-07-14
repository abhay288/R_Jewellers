"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Heart } from "lucide-react";

// Placeholder data for trending products
const trendingProducts = [
  {
    id: "t1",
    name: "Royal Kundan Choker Set",
    price: "₹299.00",
    category: "Bridal",
    image: "/images/trending-1.jpg",
  },
  {
    id: "t2",
    name: "Rose Gold Diamond Bangles",
    price: "₹149.00",
    category: "Everyday",
    image: "/images/trending-2.jpg",
  },
  {
    id: "t3",
    name: "Emerald Drop Earrings",
    price: "₹89.00",
    category: "Festive",
    image: "/images/trending-3.jpg",
  },
  {
    id: "t4",
    name: "Polki Statement Necklace",
    price: "₹199.00",
    category: "Bridal",
    image: "/images/trending-4.jpg",
  },
  {
    id: "t5",
    name: "Minimalist Pearl Pendant",
    price: "₹59.00",
    category: "Everyday",
    image: "/images/trending-5.jpg",
  }
];

export default function TrendingSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === trendingProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? trendingProducts.length - 1 : prevIndex - 1
    );
  };

  // For a basic slider, we will show 3 items on desktop, 1 on mobile
  // Note: A real production app might use Swiper.js or Embla for better touch support,
  // but we are using Framer Motion for a custom luxury feel.

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
            style={{ width: `${(trendingProducts.length / 3) * 100}%` }} // Simplified for visual layout
          >
            {trendingProducts.map((product) => (
              <div 
                key={product.id}
                className="w-full md:w-1/3 shrink-0 group"
              >
                <div className="relative h-[450px] bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                  {/* Image Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-playfair text-xl text-muted-foreground/30 animate-pulse">Product Image</span>
                  </div>
                  {/* <Image src={product.image} alt={product.name} fill className="object-cover object-center" /> */}
                  
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
                  <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">{product.category}</p>
                  <Link href={`/product/${product.id}`} className="block">
                    <h3 className="font-playfair text-xl font-medium mb-2 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-muted-foreground">{product.price}</p>
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
