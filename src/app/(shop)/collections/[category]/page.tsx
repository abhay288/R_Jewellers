"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";

// Mock data for collections
const collectionDetails: Record<string, { title: string, description: string, image: string }> = {
  "bridal": {
    title: "Bridal Collection",
    description: "Exquisite pieces crafted for your special day. Make every moment unforgettable with our royal heritage designs.",
    image: "https://images.unsplash.com/photo-1599643477873-1ef912f71625?auto=format&fit=crop&q=80&w=1200",
  },
  "festival": {
    title: "Festival Wear",
    description: "Vibrant designs celebrating joy and tradition. Perfect for adding a touch of glamour to your festive celebrations.",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=1200",
  },
  "everyday": {
    title: "Everyday Elegance",
    description: "Subtle luxury for your daily wardrobe. Minimalist designs that make a statement without overpowering your look.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200",
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "Discover our latest creations. Be the first to wear our most innovative and contemporary designs.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
  },
  "best-sellers": {
    title: "Best Sellers",
    description: "Our most loved pieces by customers worldwide. Tried, tested, and adored.",
    image: "https://images.unsplash.com/photo-1602715922011-1a067098e9b3?auto=format&fit=crop&q=80&w=1200",
  },
};

export default function CollectionCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.category;
  
  // Fallback for unknown categories
  const collection = collectionDetails[categoryId] || {
    title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace("-", " "),
    description: "Explore our stunning selection of premium jewellery pieces.",
    image: "https://images.unsplash.com/photo-1515562141207-7a8efbf69c76?auto=format&fit=crop&q=80&w=1200"
  };

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6">
        
        <Link href="/collections" className="inline-flex items-center text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All Collections
        </Link>

        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-24"
        >
          <Image
            src={collection.image}
            alt={collection.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            <h1 className="font-playfair text-5xl md:text-6xl mb-6 drop-shadow-md">{collection.title}</h1>
            <p className="max-w-2xl text-lg font-light text-white/90 drop-shadow-sm">{collection.description}</p>
          </div>
        </motion.div>

        {/* Action Section */}
        <div className="text-center">
          <h2 className="font-playfair text-3xl text-foreground mb-8">Ready to explore?</h2>
          <Link 
            href={`/shop?collection=${categoryId}`} 
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium tracking-wider uppercase px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Shop the {collection.title}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

      </div>
    </div>
  );
}
