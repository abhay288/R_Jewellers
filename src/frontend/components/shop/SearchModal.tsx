"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight, Sparkles, ShoppingBag } from "lucide-react";

interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  finalPrice: number;
  image: string | null;
  category: string;
  inStock: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_KEYWORDS = [
  "Bridal Sets",
  "Kundan Earrings",
  "Necklace",
  "Gold Bangle",
  "Royal Ring",
  "Anklets",
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSuggestions([]);
    }
  }, [isOpen]);

  // Debounced search recommendations as user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/shop/search/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Failed to fetch search suggestions:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    onClose();
    router.push(`/shop?search=${encodeURIComponent(keyword)}`);
  };

  const handleSuggestionClick = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 inset-x-4 sm:top-12 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-60 max-w-2xl w-full bg-card border border-border/60 rounded-3xl shadow-2xl overflow-hidden p-6"
          >
            {/* Header / Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
              <Search className="w-5 h-5 text-primary absolute left-4 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jewellery by name, category, or style..."
                className="w-full bg-secondary/50 border border-border/50 rounded-full pl-12 pr-12 py-3.5 text-base text-foreground focus:outline-none focus:border-primary transition-all shadow-inner"
              />
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary absolute right-12" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-12 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="ml-3 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              
              {/* Live Recommendations */}
              {query.trim() && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      Product Recommendations ({suggestions.length})
                    </span>
                    {suggestions.length > 0 && (
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs font-medium text-primary hover:underline flex items-center"
                      >
                        View all results <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-7 h-7 animate-spin text-primary mb-2" />
                      <span className="text-xs">Finding matching jewellery...</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium text-foreground">No matching products found</p>
                      <p className="text-xs mt-1">Try searching for &quot;Necklace&quot;, &quot;Earrings&quot;, or &quot;Bridal&quot;</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSuggestionClick(item.slug)}
                          className="flex items-center space-x-3 p-2.5 rounded-2xl border border-border/40 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer group"
                        >
                          <div className="relative w-14 h-14 rounded-xl bg-secondary overflow-hidden shrink-0">
                            <Image
                              src={item.image || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400"}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground capitalize truncate mt-0.5">
                              {item.category}
                            </p>
                            <p className="text-xs font-bold text-primary mt-1">
                              ₹{item.finalPrice}
                              {item.price > item.finalPrice && (
                                <span className="text-[10px] text-muted-foreground line-through ml-1.5 font-normal">
                                  ₹{item.price}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Default State: Popular Keywords & Quick Links */}
              {!query.trim() && (
                <div className="space-y-6 py-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Popular Searches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_KEYWORDS.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleKeywordClick(kw)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-secondary/60 hover:bg-primary hover:text-primary-foreground border border-border/50 transition-all"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Quick Categories
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: "Earrings", href: "/shop?category=earrings" },
                        { label: "Necklaces", href: "/shop?category=necklaces" },
                        { label: "Rings", href: "/shop?category=rings" },
                        { label: "Bangles", href: "/shop?category=bracelets" },
                        { label: "Bridal Sets", href: "/shop?collection=bridal" },
                        { label: "New Arrivals", href: "/shop?sort=newest" },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={onClose}
                          className="px-3 py-2 rounded-xl border border-border/40 text-xs font-medium text-foreground hover:border-primary hover:text-primary hover:bg-secondary/30 transition-all flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          <ArrowRight className="w-3 h-3 opacity-60" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
