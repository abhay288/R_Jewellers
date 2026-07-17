"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Share2, Star, Truck, ShieldCheck, ChevronDown, Check, Award, RotateCcw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCartStore } from "@/frontend/store/useCartStore";
import { useWishlistStore } from "@/frontend/store/useWishlistStore";
import { useRecentlyViewedStore } from "@/frontend/store/useRecentlyViewedStore";

interface ProductClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { addItem: addRecentlyViewed } = useRecentlyViewedStore();

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.finalPrice || product.price,
      image: product.images?.[0] || "",
      quantity: 1,
      category: product.category?.toString() || "Unknown"
    });
  };

  const fallbackImage = 
    product.name?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" :
    product.name?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" :
    product.name?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" :
    product.name?.toLowerCase().includes('bangle') || product.name?.toLowerCase().includes('bracelet') ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800" :
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800";

  const images = product.images && product.images.length > 0 && product.images[0] ? product.images : [fallbackImage];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://radhikajewellers.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://radhikajewellers.com/shop"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://radhikajewellers.com/product/${product._id}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-primary transition-colors">Shop</a>
          <span>/</span>
          <a href={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">Category</a>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col md:flex-row-reverse gap-4 md:gap-6">
            {/* Main Image */}
            <div className="flex-1 relative aspect-4/5 bg-secondary/30 rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center">
                {images[activeImage] ? (
                  <Image src={images[activeImage]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <span className="font-playfair text-xl text-muted-foreground/30 animate-pulse">Main Product View</span>
                )}
              </div>
              
              {/* 360 Viewer Placeholder Button */}
              <button className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md text-black px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-primary hover:text-white transition-all shadow-lg flex items-center space-x-2 z-10">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                <span>360° View</span>
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 md:w-24 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative w-20 h-24 md:w-full md:h-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                    activeImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
                    {img ? (
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground/30 uppercase">Thumb {idx + 1}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-playfair font-bold leading-tight max-w-sm">{product.name}</h1>
                <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shrink-0">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-2xl text-primary font-medium mb-4">₹{product.finalPrice || product.price}</p>
                {product.discount > 0 && (
                  <p className="text-lg text-muted-foreground line-through mb-4">₹{product.price}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                <div className="flex text-[#D4AF37]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span>({product.ratingsCount || 0} Reviews)</span>
              </div>
              
              <p className="text-muted-foreground leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 py-6 border-y border-border/50">
              <div className="flex items-center space-x-2 text-xs">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-muted-foreground">Lifetime Plating</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <Award className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-muted-foreground">100% Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <RotateCcw className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-muted-foreground">Easy Exchange</span>
              </div>
            </div>

            {/* Sticky Add to Cart */}
            <div className="sticky bottom-4 z-40 bg-background/95 backdrop-blur-md p-4 lg:p-0 lg:static lg:bg-transparent rounded-2xl lg:rounded-none shadow-2xl lg:shadow-none border border-border/50 lg:border-none mb-10 flex space-x-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={cn(
                  "flex-1 text-primary-foreground h-14 rounded-full font-medium tracking-wider uppercase text-sm transition-opacity",
                  product.stock > 0 ? "bg-primary hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                onClick={() => toggleWishlist(product._id)}
                className={cn(
                  "w-14 h-14 rounded-full border border-border flex items-center justify-center transition-colors shrink-0",
                  wishlistItems.includes(product._id) ? "text-red-500 hover:text-red-600" : "text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                )}
              >
                <Heart className={cn("w-5 h-5", wishlistItems.includes(product._id) && "fill-current")} />
              </button>
            </div>
            {/* Accordion Specs */}
            <div className="space-y-1">
              <div className="flex border-b border-border/50 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
                <button 
                  onClick={() => setActiveTab("description")}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0",
                    activeTab === "description" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab("specs")}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0",
                    activeTab === "specs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Specifications
                </button>
                <button 
                  onClick={() => setActiveTab("craftsmanship")}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0",
                    activeTab === "craftsmanship" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Craftsmanship
                </button>
                <button 
                  onClick={() => setActiveTab("reviews")}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 shrink-0",
                    activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Reviews (24)
                </button>
              </div>
              
              <div className="min-h-[220px]">
                {activeTab === "description" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground leading-relaxed font-light text-sm">
                    <p className="mb-4">
                      {product.description}
                    </p>
                  </motion.div>
                )}
                
                {activeTab === "specs" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                    <table className="w-full text-left text-sm border-collapse">
                      <tbody>
                        <tr className="border-b border-border/30">
                          <th className="py-2.5 font-light text-muted-foreground">Material</th>
                          <td className="py-2.5 text-right font-medium text-foreground">{product.material || "Premium Alloy (Gold Plated)"}</td>
                        </tr>
                        <tr className="border-b border-border/30">
                          <th className="py-2.5 font-light text-muted-foreground">Color</th>
                          <td className="py-2.5 text-right font-medium text-foreground">{product.color || "Gold"}</td>
                        </tr>
                        <tr className="border-b border-border/30">
                          <th className="py-2.5 font-light text-muted-foreground">Weight</th>
                          <td className="py-2.5 text-right font-medium text-foreground">{product.weight || "N/A"}</td>
                        </tr>
                        <tr className="border-b border-border/30">
                          <th className="py-2.5 font-light text-muted-foreground">Occasion</th>
                          <td className="py-2.5 text-right font-medium text-foreground">{product.occasion || "Bridal / Festive"}</td>
                        </tr>
                        <tr className="border-b border-border/30">
                          <th className="py-2.5 font-light text-muted-foreground">SKU</th>
                          <td className="py-2.5 text-right font-medium text-foreground">{product.sku || product._id}</td>
                        </tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {activeTab === "craftsmanship" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-sm">
                    <div className="border-l-2 border-primary pl-4 py-0.5">
                      <h4 className="font-playfair font-semibold text-primary text-sm">Artisan Heritage</h4>
                      <p className="text-muted-foreground font-light leading-relaxed mt-1">
                        Each luxury piece in our collection is handcrafted by master artisans. We employ authentic Kundan settings, premium multi-layered gold plating, and hand-selected semi-precious stones to guarantee royal-grade elegance.
                      </p>
                    </div>
                    <div className="border-l-2 border-primary pl-4 py-0.5">
                      <h4 className="font-playfair font-semibold text-primary text-sm">Luxury Care & Handling</h4>
                      <p className="text-muted-foreground font-light leading-relaxed mt-1">
                        Avoid direct contact with perfumes, hairspray, and sanitizers. Wipe clean with a soft dry microfiber cloth after use, and store in our moisture-resistant velvet box.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center space-x-4 pb-4 border-b border-border/30">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">4.8</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Rating</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex text-[#D4AF37] mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Based on 24 verified reviews</p>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">Priya Sharma</span>
                          <span className="text-muted-foreground">12 Jun 2026</span>
                        </div>
                        <div className="flex text-[#D4AF37]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed mt-1">
                          Beautiful craftsmanship. The shine and finish look very realistic and luxury. Highly recommended!
                        </p>
                      </div>

                      <div className="space-y-1 border-t border-border/20 pt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">Anjali Gupta</span>
                          <span className="text-muted-foreground">01 Jul 2026</span>
                        </div>
                        <div className="flex text-[#D4AF37]">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                          <Star className="w-3 h-3 text-muted/30" />
                        </div>
                        <p className="text-xs text-muted-foreground font-light leading-relaxed mt-1">
                          Extremely premium feel and excellent packaging. Got many compliments at the wedding.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
