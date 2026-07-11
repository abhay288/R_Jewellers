"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductGridSkeleton } from "@/components/ui/ProductSkeleton";
import { useCartStore } from "@/store/useCartStore";

// Placeholder data for shop
const categories = ["All", "Bridal", "Everyday", "Festive", "Necklaces", "Earrings", "Bangles"];
const products = Array.from({ length: 12 }).map((_, i) => ({
  id: `p${i}`,
  name: `Luxury Piece ${i + 1}`,
  price: `₹${(Math.random() * 500 + 50).toFixed(2)}`,
  category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
  image: `/images/product-${(i % 5) + 1}.jpg`,
}));

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    // Simulate network request
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl font-playfair font-bold mb-4">
            Our <span className="text-gradient-gold italic font-normal">Collection</span>
          </h1>
          <p className="text-muted-foreground">
            Explore our meticulously crafted artificial jewellery pieces, designed to elevate your everyday elegance and make your special moments unforgettable.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 pb-6 border-b border-border/50">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <button 
              className="flex items-center space-x-2 text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isFilterOpen && "rotate-180")} />
            </button>
            <span className="text-muted-foreground text-sm ml-4">
              {filteredProducts.length} Products
            </span>
          </div>

          {/* Desktop Categories */}
          <div className="hidden md:flex flex-wrap justify-center gap-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "text-sm uppercase tracking-wider transition-colors",
                  activeCategory === category 
                    ? "text-primary font-bold border-b-2 border-primary pb-1" 
                    : "text-muted-foreground hover:text-foreground pb-1 border-b-2 border-transparent"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            <select className="bg-transparent text-foreground border-none outline-none cursor-pointer uppercase tracking-wider font-medium">
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Mobile Categories Dropdown (Visible when filter is open) */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mb-8"
            >
              <div className="flex flex-col space-y-4 py-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      "text-left text-sm uppercase tracking-wider transition-colors",
                      activeCategory === category ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
          >
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={product.id}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-3/4 bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-playfair text-xl text-muted-foreground/30 animate-pulse">Product</span>
                    </div>
                    {/* <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> */}
                    
                    {/* Action Buttons overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex justify-center space-x-4 bg-linear-to-t from-black/50 to-transparent">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: parseFloat(product.price.replace('₹', '')),
                            image: product.image,
                            quantity: 1,
                            category: product.category
                          });
                        }}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                      <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">{product.category}</p>
                    <Link href={`/product/${product.id}`} className="block">
                      <h3 className="font-playfair text-lg font-medium mb-2 hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-primary font-medium">{product.price}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-32">
            <h3 className="text-2xl font-playfair text-muted-foreground">No products found in this category.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
