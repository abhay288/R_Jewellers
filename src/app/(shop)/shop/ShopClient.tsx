"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  ChevronDown, 
  Heart, 
  ShoppingBag, 
  X, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Check
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ProductGridSkeleton } from "@/frontend/components/ui/ProductSkeleton";
import { useCartStore } from "@/frontend/store/useCartStore";
import { useWishlistStore } from "@/frontend/store/useWishlistStore";
import ProductCardImageSlider from "@/frontend/components/shop/ProductCardImageSlider";

interface ShopClientProps {
  initialProducts: any; // PaginationResult<IProduct>
  categories: any[];
  initialCategory?: string;
  initialCollection?: string;
  initialSort?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialInStock?: string;
  initialSearch?: string;
  currentPage?: number;
}

const COLLECTIONS = [
  { id: "All", name: "All Collections" },
  { id: "bridal", name: "Bridal Collection" },
  { id: "everyday", name: "Everyday Elegance" },
  { id: "festival", name: "Festival Glow" },
  { id: "heritage", name: "Heritage Classics" },
  { id: "royal", name: "Royal Sets" },
];

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹1,000", min: "", max: "1000" },
  { label: "₹1,000 - ₹5,000", min: "1000", max: "5000" },
  { label: "₹5,000 - ₹10,000", min: "5000", max: "10000" },
  { label: "Above ₹10,000", min: "10000", max: "" },
];

export default function ShopClient({ 
  initialProducts, 
  categories, 
  initialCategory = "All",
  initialCollection = "All",
  initialSort = "newest",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialInStock = "",
  initialSearch = "",
  currentPage = 1,
}: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Custom price range state
  const [customMin, setCustomMin] = useState(initialMinPrice);
  const [customMax, setCustomMax] = useState(initialMaxPrice);
  const [searchInput, setSearchInput] = useState(initialSearch);

  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, items: wishlistItems } = useWishlistStore();

  const products = initialProducts?.data || [];
  const totalProducts = initialProducts?.total || 0;
  const totalPages = initialProducts?.totalPages || 1;

  useEffect(() => {
    setCustomMin(initialMinPrice);
    setCustomMax(initialMaxPrice);
    setSearchInput(initialSearch);
  }, [initialMinPrice, initialMaxPrice, initialSearch]);

  const updateFilters = (updates: Record<string, string | null | undefined>) => {
    setIsNavigating(true);
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "All" && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 unless changing page specifically
    if (!("page" in updates)) {
      params.delete("page");
    }

    router.push(`${pathname}?${params.toString()}`);
    setIsNavigating(false);
  };

  const handleClearAll = () => {
    setIsNavigating(true);
    router.push(pathname);
    setIsNavigating(false);
  };

  const handleApplyPrice = () => {
    updateFilters({
      minPrice: customMin || null,
      maxPrice: customMax || null,
    });
  };

  const activeCategory = initialCategory;
  const activeCollection = initialCollection;
  const activeSort = initialSort;
  const activeInStock = initialInStock === "true";

  // Check if any filters are applied
  const hasActiveFilters = 
    (activeCategory && activeCategory !== "All") ||
    (activeCollection && activeCollection !== "All") ||
    initialMinPrice ||
    initialMaxPrice ||
    activeInStock ||
    initialSearch;

  return (
    <div className="min-h-screen bg-background pt-28 pb-24">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-playfair font-bold mb-4">
            Our <span className="text-gradient-gold italic font-normal">Collection</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Explore our meticulously crafted artificial jewellery pieces, designed to elevate your everyday elegance and make your special moments unforgettable.
          </p>
        </div>

        {/* Search & Main Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search products or collections..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateFilters({ search: searchInput });
                }
              }}
              className="w-full bg-secondary/50 border border-border/50 rounded-full pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {searchInput ? (
              <button 
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: null });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Quick Categories Bar (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 overflow-x-auto hide-scrollbar py-1">
            <button
              onClick={() => updateFilters({ category: "All" })}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap",
                activeCategory === "All" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              All
            </button>
            {categories.map((cat) => {
              const catSlug = cat.slug || cat._id;
              const isActive = activeCategory === catSlug || activeCategory === cat.name;
              return (
                <button
                  key={cat._id}
                  onClick={() => updateFilters({ category: catSlug })}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Toggle Filter Button & Sort */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center space-x-2 px-5 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all",
                isFilterOpen || hasActiveFilters
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-secondary/50 text-foreground hover:bg-secondary"
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isFilterOpen && "rotate-180")} />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-muted-foreground uppercase font-medium tracking-wider hidden sm:inline">Sort:</span>
              <select 
                value={activeSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="bg-secondary/50 border border-border/50 rounded-full px-4 py-2.5 text-xs text-foreground uppercase tracking-wider font-semibold focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="featured">Featured</option>
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Filter Drawer / Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <h3 className="font-playfair text-lg font-bold text-foreground">Filter Products</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs font-semibold text-destructive hover:underline flex items-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Clear All Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateFilters({ category: "All" })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          activeCategory === "All" ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/60 hover:bg-secondary text-foreground"
                        )}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => {
                        const catSlug = cat.slug || cat._id;
                        const isActive = activeCategory === catSlug || activeCategory === cat.name;
                        return (
                          <button
                            key={cat._id}
                            onClick={() => updateFilters({ category: catSlug })}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                              isActive ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/60 hover:bg-secondary text-foreground"
                            )}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Collection Filter */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Curated Theme</h4>
                    <div className="flex flex-wrap gap-2">
                      {COLLECTIONS.map((col) => {
                        const isActive = activeCollection.toLowerCase() === col.id.toLowerCase();
                        return (
                          <button
                            key={col.id}
                            onClick={() => updateFilters({ collection: col.id })}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                              isActive ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/60 hover:bg-secondary text-foreground"
                            )}
                          >
                            {col.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Presets & Inputs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Range (₹)</h4>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {PRICE_PRESETS.map((preset) => {
                        const isActive = initialMinPrice === preset.min && initialMaxPrice === preset.max;
                        return (
                          <button
                            key={preset.label}
                            onClick={() => {
                              setCustomMin(preset.min);
                              setCustomMax(preset.max);
                              updateFilters({ minPrice: preset.min || null, maxPrice: preset.max || null });
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                              isActive ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/60 hover:bg-secondary text-foreground"
                            )}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input 
                        type="number"
                        placeholder="Min ₹"
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        className="w-1/2 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-muted-foreground">-</span>
                      <input 
                        type="number"
                        placeholder="Max ₹"
                        value={customMax}
                        onChange={(e) => setCustomMax(e.target.value)}
                        className="w-1/2 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleApplyPrice}
                        className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability</h4>
                    <label className="flex items-center space-x-3 cursor-pointer bg-background border border-border/50 rounded-xl p-3">
                      <input 
                        type="checkbox"
                        checked={activeInStock}
                        onChange={(e) => updateFilters({ inStock: e.target.checked ? "true" : null })}
                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-foreground">In Stock Only</span>
                    </label>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-secondary/30 p-3 rounded-2xl border border-border/40">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Active Filters:</span>
            
            {activeCategory && activeCategory !== "All" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Category: {activeCategory}
                <button onClick={() => updateFilters({ category: null })} className="ml-1.5 hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeCollection && activeCollection !== "All" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Collection: {activeCollection}
                <button onClick={() => updateFilters({ collection: null })} className="ml-1.5 hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(initialMinPrice || initialMaxPrice) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Price: ₹{initialMinPrice || "0"} - ₹{initialMaxPrice || "∞"}
                <button onClick={() => updateFilters({ minPrice: null, maxPrice: null })} className="ml-1.5 hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeInStock && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                In Stock Only
                <button onClick={() => updateFilters({ inStock: null })} className="ml-1.5 hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {initialSearch && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                Search: &quot;{initialSearch}&quot;
                <button onClick={() => updateFilters({ search: null })} className="ml-1.5 hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-destructive hover:underline ml-auto px-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Total Count Info */}
        <div className="flex items-center justify-between mb-6 text-xs text-muted-foreground">
          <span>Showing <strong className="text-foreground font-semibold">{products.length}</strong> of <strong className="text-foreground font-semibold">{totalProducts}</strong> products</span>
        </div>

        {/* Product Grid */}
        {isNavigating ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-8 lg:gap-y-10"
          >
            <AnimatePresence>
              {products.map((product: any) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  key={product._id}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-4/5 rounded-xl overflow-hidden mb-3 group/card border border-border/40 bg-card shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                    <ProductCardImageSlider
                      images={product.images || []}
                      productName={product.name}
                      href={`/product/${product.slug || product._id}`}
                      fallbackCategory={product.category?.toString() || product.name}
                      className="w-full h-full"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 pointer-events-none">
                      {product.discount > 0 && (
                        <span className="px-2.5 py-1 bg-amber-500 text-white font-bold text-[10px] tracking-wider rounded-full uppercase shadow-sm">
                          {product.discount}% OFF
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="px-2.5 py-1 bg-primary text-primary-foreground font-bold text-[10px] tracking-wider rounded-full uppercase shadow-sm">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Quick Wishlist Icon Top Right */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product._id);
                      }}
                      className={cn(
                        "absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer hover:scale-110",
                        wishlistItems.includes(product._id) ? "text-red-500 fill-red-500" : "text-foreground hover:text-primary"
                      )}
                      title="Add to Wishlist"
                    >
                      <Heart className={cn("w-4 h-4", wishlistItems.includes(product._id) && "fill-current")} />
                    </button>
                    
                    {/* Action Buttons overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover/card:opacity-100 transform translate-y-4 group-hover/card:translate-y-0 transition-all duration-300 flex justify-center space-x-3 bg-linear-to-t from-black/60 via-black/30 to-transparent z-30 pointer-events-auto">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem({
                            id: product._id,
                            name: product.name,
                            price: product.finalPrice || product.price,
                            image: product.images?.[0] || '',
                            quantity: 1,
                            category: product.category?.toString() || 'Unknown'
                          });
                        }}
                        className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold text-xs rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Quick Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <Link href={`/product/${product.slug || product._id}`} className="block">
                      <h3 className="font-playfair text-base font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <p className="text-primary font-bold text-base">₹{(product.finalPrice || product.price)?.toLocaleString('en-IN')}</p>
                      {product.discount > 0 && (
                        <p className="text-muted-foreground text-xs line-through">₹{product.price?.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {products.length === 0 && !isNavigating && (
          <div className="text-center py-24 bg-secondary/20 rounded-3xl border border-border/40 mt-8">
            <h3 className="text-2xl font-playfair text-foreground font-semibold mb-2">No products match your filters</h3>
            <p className="text-muted-foreground text-sm mb-6">Try clearing or adjusting your selected filters.</p>
            <button
              onClick={handleClearAll}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-3 mt-16 pt-8 border-t border-border/50">
            <button
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
              className="p-3 rounded-full border border-border/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => updateFilters({ page: pageNum.toString() })}
                className={cn(
                  "w-10 h-10 rounded-full text-xs font-semibold transition-all",
                  pageNum === currentPage
                    ? "bg-primary text-primary-foreground font-bold shadow-md"
                    : "border border-border/50 text-foreground hover:bg-secondary"
                )}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
              className="p-3 rounded-full border border-border/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
