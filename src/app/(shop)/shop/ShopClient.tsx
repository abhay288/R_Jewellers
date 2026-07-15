"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ProductGridSkeleton } from "@/frontend/components/ui/ProductSkeleton";
import { useCartStore } from "@/frontend/store/useCartStore";
import { useWishlistStore } from "@/frontend/store/useWishlistStore";

interface ShopClientProps {
  initialProducts: any; // PaginationResult<IProduct>
  categories: any[];
  initialCategory: string;
  initialSort: string;
}

export default function ShopClient({ initialProducts, categories, initialCategory, initialSort }: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, items: wishlistItems } = useWishlistStore();

  const products = initialProducts?.data || [];
  const totalProducts = initialProducts?.total || 0;

  const handleFilterChange = (key: string, value: string) => {
    setIsNavigating(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page on filter change
    if (key !== 'page') params.delete('page');
    
    router.push(`${pathname}?${params.toString()}`);
    setIsNavigating(false);
  };

  const activeCategory = initialCategory;

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
              {totalProducts} Products
            </span>
          </div>

          {/* Desktop Categories */}
          <div className="hidden md:flex flex-wrap justify-center gap-6">
            <button
              onClick={() => handleFilterChange('category', 'All')}
              className={cn(
                "text-sm uppercase tracking-wider transition-colors",
                activeCategory === 'All' 
                  ? "text-primary font-bold border-b-2 border-primary pb-1" 
                  : "text-muted-foreground hover:text-foreground pb-1 border-b-2 border-transparent"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleFilterChange('category', category.slug || category._id)}
                className={cn(
                  "text-sm uppercase tracking-wider transition-colors",
                  activeCategory === (category.slug || category._id)
                    ? "text-primary font-bold border-b-2 border-primary pb-1" 
                    : "text-muted-foreground hover:text-foreground pb-1 border-b-2 border-transparent"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            <select 
              value={initialSort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="bg-transparent text-foreground border-none outline-none cursor-pointer uppercase tracking-wider font-medium"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="featured">Featured</option>
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Mobile Categories Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mb-8"
            >
              <div className="flex flex-col space-y-4 py-4">
                <button
                    onClick={() => {
                      handleFilterChange('category', 'All');
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      "text-left text-sm uppercase tracking-wider transition-colors",
                      activeCategory === 'All' ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                  >
                    All
                  </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => {
                      handleFilterChange('category', category.slug || category._id);
                      setIsFilterOpen(false);
                    }}
                    className={cn(
                      "text-left text-sm uppercase tracking-wider transition-colors",
                      activeCategory === (category.slug || category._id) ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {isNavigating ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
          >
            <AnimatePresence>
              {products.map((product: any) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={product._id}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-3/4 bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {product.images && product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <span className="font-playfair text-xl text-muted-foreground/30 animate-pulse">Product</span>
                      )}
                    </div>
                    
                    {/* Action Buttons overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex justify-center space-x-4 bg-linear-to-t from-black/50 to-transparent">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: product._id,
                            name: product.name,
                            price: product.finalPrice || product.price,
                            image: product.images?.[0] || '',
                            quantity: 1,
                            category: product.category?.toString() || 'Unknown' // Ideally populated, but keeping safe
                          });
                        }}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product._id);
                          // We'll also fire an API call if user is logged in (to be added)
                        }}
                        className={cn(
                          "w-12 h-12 bg-white text-black rounded-full flex items-center justify-center transition-colors shadow-lg",
                          wishlistItems.includes(product._id) ? "text-red-500 hover:text-red-600" : "hover:bg-primary hover:text-white"
                        )}
                      >
                        <Heart className={cn("w-5 h-5", wishlistItems.includes(product._id) && "fill-current")} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link href={`/product/${product.slug || product._id}`} className="block">
                      <h3 className="font-playfair text-lg font-medium mb-2 hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-center space-x-2">
                      <p className="text-primary font-medium">₹{product.finalPrice || product.price}</p>
                      {product.discount > 0 && (
                        <p className="text-muted-foreground text-sm line-through">₹{product.price}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {products.length === 0 && !isNavigating && (
          <div className="text-center py-32">
            <h3 className="text-2xl font-playfair text-muted-foreground">No products found.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
