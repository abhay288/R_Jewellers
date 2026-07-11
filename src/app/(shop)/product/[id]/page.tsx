"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Share2, Star, Truck, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

// Mock Product Data
const product = {
  id: "p1",
  name: "Royal Kundan Bridal Choker Set",
  price: "₹899.00",
  description: "A masterpiece of traditional craftsmanship, this Royal Kundan Choker set features exquisite artificial polki diamonds set in a gold-plated base. Perfect for bridal wear, it exudes timeless elegance and regal charm.",
  images: [
    "/images/product-main.jpg",
    "/images/product-detail-1.jpg",
    "/images/product-detail-2.jpg",
    "/images/product-detail-3.jpg",
  ],
  specs: [
    { label: "Material", value: "Brass with 22k Gold Plating" },
    { label: "Stone Type", value: "Artificial Kundan & Polki" },
    { label: "Weight", value: "145 grams" },
    { label: "Dimensions", value: "Choker: 8x4 inches, Earrings: 3x1.5 inches" },
  ]
};

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace('₹', '')),
      image: product.images[0],
      quantity: 1,
      category: "Bridal"
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="container mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-primary transition-colors">Shop</a>
          <span>/</span>
          <a href="/collections/bridal" className="hover:text-primary transition-colors">Bridal</a>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col md:flex-row-reverse gap-4 md:gap-6">
            {/* Main Image */}
            <div className="flex-1 relative aspect-4/5 bg-secondary/30 rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-playfair text-xl text-muted-foreground/30 animate-pulse">Main Product View</span>
              </div>
              {/* <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" /> */}
              
              {/* 360 Viewer Placeholder Button */}
              <button className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md text-black px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-primary hover:text-white transition-all shadow-lg flex items-center space-x-2 z-10">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                <span>360° View</span>
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 md:w-24 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative w-20 h-24 md:w-full md:h-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                    activeImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground/30 uppercase">Thumb {idx + 1}</span>
                  </div>
                  {/* <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" /> */}
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
              <p className="text-2xl text-primary font-medium mb-4">{product.price}</p>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                <div className="flex text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span>(124 Reviews)</span>
              </div>
              
              <p className="text-muted-foreground leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-10 py-6 border-y border-border/50">
              <div className="flex items-center space-x-3 text-sm">
                <Truck className="w-5 h-5 text-primary" />
                <span className="font-medium">Free Global Shipping</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-medium">Lifetime Warranty</span>
              </div>
            </div>

            {/* Sticky Add to Cart (Desktop behaves normally, mobile can be sticky) */}
            <div className="sticky bottom-4 z-40 bg-background/95 backdrop-blur-md p-4 lg:p-0 lg:static lg:bg-transparent rounded-2xl lg:rounded-none shadow-2xl lg:shadow-none border border-border/50 lg:border-none mb-10 flex space-x-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-primary-foreground h-14 rounded-full font-medium tracking-wider uppercase text-sm hover:opacity-90 transition-opacity"
              >
                Add to Cart
              </button>
              <button className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shrink-0">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Accordion Specs */}
            <div className="space-y-1">
              {/* Tab headers */}
              <div className="flex border-b border-border/50 mb-6">
                <button 
                  onClick={() => setActiveTab("description")}
                  className={cn(
                    "px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors border-b-2",
                    activeTab === "description" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab("details")}
                  className={cn(
                    "px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors border-b-2",
                    activeTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Details
                </button>
              </div>
              
              {/* Tab content */}
              <div className="min-h-[200px]">
                {activeTab === "description" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground leading-relaxed font-light">
                    <p className="mb-4">
                      Embrace the grandeur of ancient royalty with this exquisite choker set. Crafted with meticulous attention to detail, each stone is hand-set by master artisans using techniques passed down through generations.
                    </p>
                    <p>
                      The luxurious 22k gold plating ensures a lasting shine, while the premium artificial Polki diamonds offer a brilliant sparkle that flawlessly mimics the real thing. Pair it with your bridal lehenga or a majestic silk saree for a look that commands the room.
                    </p>
                  </motion.div>
                )}
                {activeTab === "details" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ul className="space-y-4">
                      {product.specs.map((spec, idx) => (
                        <li key={idx} className="flex justify-between py-2 border-b border-border/30 last:border-0">
                          <span className="text-muted-foreground font-light">{spec.label}</span>
                          <span className="font-medium text-right">{spec.value}</span>
                        </li>
                      ))}
                    </ul>
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
