"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface ProductCardImageSliderProps {
  images: string[];
  productName: string;
  href: string;
  fallbackCategory?: string;
  className?: string;
}

export default function ProductCardImageSlider({
  images,
  productName,
  href,
  fallbackCategory = "",
  className = "relative aspect-3/4 bg-secondary/30 rounded-2xl overflow-hidden mb-6",
}: ProductCardImageSliderProps) {
  const defaultFallback =
    fallbackCategory.toLowerCase().includes("earring")
      ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800"
      : fallbackCategory.toLowerCase().includes("neck")
      ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
      : fallbackCategory.toLowerCase().includes("ring")
      ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"
      : fallbackCategory.toLowerCase().includes("bangle") || fallbackCategory.toLowerCase().includes("bracelet")
      ? "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
      : "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800";

  const mediaList = images && images.length > 0 ? images : [defaultFallback];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Automatically slide continuously if images > 1
  useEffect(() => {
    if (mediaList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [mediaList.length]);

  return (
    <Link
      href={href}
      className={cn("block group/slider cursor-pointer relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.85 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image
            src={mediaList[currentIndex] || defaultFallback}
            alt={productName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out",
              isHovered ? "scale-108" : "scale-100"
            )}
          />
          {/* Subtle gradient vignette for depth */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-500" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators if images > 1 */}
      {mediaList.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 px-2 pointer-events-none">
          {mediaList.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 shadow-xs",
                idx === currentIndex
                  ? "w-5 bg-amber-400"
                  : "w-1.5 bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
