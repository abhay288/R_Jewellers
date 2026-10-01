"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

const editorialCampaigns = [
  {
    title: "Bridal Elegance",
    slug: "bridal-sets",
    tagline: "HERITAGE LEGACY",
    number: "01",
    desc: "Exquisite heavy Kundan and Polki designs crafted for your once-in-a-lifetime moments. Each piece is a story told in gold.",
    image: "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?q=80&w=1200"
  },
  {
    title: "Daily Luxury",
    slug: "rings",
    tagline: "MODERN ESSENTIALS",
    number: "02",
    desc: "Sleek and skin-safe premium everyday wear that brings subtle sparkle to any look. Crafted for the woman who demands excellence.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Festive Collection",
    slug: "festival-collection",
    tagline: "CELEBRATION GOLD",
    number: "03",
    desc: "Vibrant traditional craftsmanship styled for major festival ensembles and events. Born from centuries of artisan wisdom.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Office Wear",
    slug: "earrings",
    tagline: "MINIMALIST STATEMENT",
    number: "04",
    desc: "Sophisticated, lightweight jewellery that adds poise to your professional wardrobe. Effortless luxury for every boardroom.",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Wedding Collection",
    slug: "necklaces",
    tagline: "ROYAL MAHARANIS",
    number: "05",
    desc: "Ornate masterpieces that embody royal heritage, designed for the modern bride seeking timeless grandeur.",
    image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=1200"
  },
  {
    title: "Limited Edition",
    slug: "gift-collection",
    tagline: "EXCLUSIVE DESIGNS",
    number: "06",
    desc: "Highly exclusive designer pieces made in low batches for the discerning collector who values true rarity.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200"
  }
];

function EditorialBanner({
  collection,
  index
}: {
  collection: (typeof editorialCampaigns)[0];
  index: number;
}) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start end", "end start"]
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <motion.div
      ref={bannerRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} min-h-140 group`}
    >
      {/* Image Panel — 55% width */}
      <div className="relative w-full lg:w-[55%] h-95 lg:h-auto overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: imageY }}>
          <Image
            src={collection.image}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
          />
        </motion.div>
        {/* Subtle overlay */}
        <div className={`absolute inset-0 ${isEven ? "bg-linear-to-r" : "bg-linear-to-l"} from-transparent to-black/10 pointer-events-none z-10`} />
        
        {/* Collection number watermark */}
        <div className="absolute bottom-6 right-6 z-20 select-none">
          <span className="font-playfair text-[80px] leading-none font-bold text-white/10 pointer-events-none">
            {collection.number}
          </span>
        </div>
      </div>

      {/* Text Panel — 45% width */}
      <div className={`relative w-full lg:w-[45%] flex items-center section-ivory border-t lg:border-t-0 ${isEven ? "lg:border-l" : "lg:border-r"} border-[rgba(201,162,39,0.12)]`}>
        {/* Decorative corner accent */}
        <div className={`absolute top-8 ${isEven ? "left-8" : "right-8"} w-px h-16 bg-primary/30`} />

        <div className={`px-10 lg:px-16 xl:px-20 py-16 ${isEven ? "" : "lg:text-right"}`}>
          {/* Label row */}
          <div className={`flex items-center gap-4 mb-6 ${isEven ? "" : "lg:justify-end"}`}>
            <span className="label-luxury text-primary">{collection.tagline}</span>
            <div className="h-px w-10 bg-primary/40" />
          </div>

          {/* Main heading */}
          <h3 className="font-playfair font-bold text-foreground mb-6 leading-none"
            style={{ fontSize: "clamp(2.5rem, 4vw, 3.75rem)" }}>
            {collection.title}
          </h3>

          {/* Gold rule */}
          <div className={`flex ${isEven ? "" : "lg:justify-end"} mb-8`}>
            <div className="h-px w-16 bg-linear-to-r from-[#C9A227] to-[#E6C280]" />
          </div>

          {/* Description */}
          <p className={`text-muted-foreground font-light leading-[1.9] text-base mb-10 ${isEven ? "max-w-md" : "max-w-md lg:ml-auto"}`}>
            {collection.desc}
          </p>

          {/* CTA */}
          <Link
            href={`/shop?category=${collection.slug}`}
            className={`group/link inline-flex items-center gap-3 ${isEven ? "" : "lg:ml-auto lg:flex"}`}
          >
            <span className="label-luxury text-foreground group-hover/link:text-primary transition-colors duration-300">
              Explore Collection
            </span>
            <span className="w-8 h-px bg-foreground group-hover/link:w-16 group-hover/link:bg-primary transition-all duration-500 ease-out" />
            <ArrowRight className="w-3.5 h-3.5 text-foreground group-hover/link:text-primary group-hover/link:translate-x-1 transition-all duration-300" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturedCollections({ collections }: { collections?: any[] }) {
  return (
    <section className="bg-white border-t border-b border-[rgba(201,162,39,0.12)]">
      {/* Section Header */}
      <div className="container mx-auto px-6 py-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-end">
          <div className="max-w-xl">
            <span className="label-luxury text-primary block mb-4">Editorial Campaigns</span>
            <h2 className="font-playfair font-bold text-foreground mb-5"
              style={{ fontSize: "clamp(2.75rem, 5vw, 4.25rem)", lineHeight: 1.05 }}>
              Featured{" "}
              <em className="text-gradient-gold font-normal not-italic">Collections</em>
            </h2>
            <p className="body-luxury text-muted-foreground">
              Explore our meticulously designed collections created to bring out your inner radiance.
            </p>
          </div>
          <Link
            href="/shop"
            className="group hidden md:inline-flex items-center gap-3 mt-6 md:mt-0"
          >
            <span className="label-luxury text-muted-foreground group-hover:text-primary transition-colors duration-300">
              View All
            </span>
            <span className="w-8 h-px bg-border group-hover:w-16 group-hover:bg-primary transition-all duration-500" />
          </Link>
        </div>
      </div>

      {/* Editorial Banners */}
      <div className="divide-y divide-[rgba(201,162,39,0.08)]">
        {editorialCampaigns.map((collection, index) => (
          <EditorialBanner
            key={collection.title}
            collection={collection}
            index={index}
          />
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="mt-12 pb-12 text-center md:hidden">
        <Link
          href="/shop"
          className="inline-flex items-center gap-3"
        >
          <span className="label-luxury text-muted-foreground">View All Collections</span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </Link>
      </div>
    </section>
  );
}
