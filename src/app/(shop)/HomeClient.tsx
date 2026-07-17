"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, animate } from "framer-motion";
import { ArrowRight, Star, ShieldCheck, Award, Heart, HelpCircle, ChevronLeft, ChevronRight, Mail, Sparkles, Navigation } from "lucide-react";
import FeaturedCollections from "@/frontend/components/home/FeaturedCollections";
import BrandStory from "@/frontend/components/home/BrandStory";
import TrendingSlider from "@/frontend/components/home/TrendingSlider";

// Staggered animated counter component
function Counter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString() + suffix);
  
  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function HomeClient({ 
  featuredProducts, 
  trendingProducts, 
  bestSellers,
  categories
}: { 
  featuredProducts: any[], 
  trendingProducts: any[], 
  bestSellers: any[],
  categories: any[]
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Scroll progress for gold accent bar
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scrollWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Set loading timeout on mount (Lenis smooth scroll is managed globally by SmoothScroll)
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1600);

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  // Luxury customer review testimonials
  const testimonials = [
    {
      name: "Aishwarya Rai",
      location: "Mumbai, Maharashtra",
      rating: 5,
      comment: "The craftsmanship of the Royal Kundan Set is absolutely breath-taking. It looks and feels like heritage fine jewellery. I wore it for my wedding reception, and the compliments never stopped.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Priyanka Sharma",
      location: "New Delhi, Delhi",
      rating: 5,
      comment: "I am extremely sensitive to alloys, but Radhika Jewellers' pieces are genuinely skin-safe and hypoallergenic. The gold finish has a gorgeous luxury polish, not brassy at all.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Meera Deshmukh",
      location: "Pune, Maharashtra",
      rating: 5,
      comment: "Exceptional customer support and premium luxury packaging. The jewellery arrived in a beautiful velvet-lined gift box with validation certificates. Highly recommended brand!",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
    }
  ];

  return (
    <>
      {/* Luxury Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="font-playfair text-4xl md:text-6xl tracking-[0.2em] text-gradient-gold mb-3">
                RADHIKA
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                Luxury Jewellery Boutique
              </p>
              <motion.div 
                className="h-[1px] w-24 bg-primary/40 mx-auto mt-8 relative overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-primary w-1/2"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="flex flex-col min-h-screen bg-background relative" 
        ref={containerRef}
        onMouseMove={handleMouseMove}
      >
        {/* Style block for luxury animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(2deg); }
          }
          @keyframes shine {
            0% { left: -100%; }
            100% { left: 200%; }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
          }
          @keyframes goldDust {
            0% { transform: translateY(100vh) translateX(0) scale(0.8); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(-10vh) translateX(50px) scale(1.2); opacity: 0; }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-shine {
            position: relative;
            overflow: hidden;
          }
          .animate-shine::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-25deg);
            animation: shine 4s ease-in-out infinite;
          }
          .sparkle-dot {
            animation: sparkle 3s ease-in-out infinite;
          }
          .dust-particle {
            position: absolute;
            width: 3px;
            height: 3px;
            background: #C9A227;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            animation: goldDust 12s linear infinite;
          }
        `}} />

        {/* Scroll Progress Gold Line */}
        <motion.div 
          className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[999] origin-left"
          style={{ width: scrollWidth }}
        />

        {/* Gold Dust Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i} 
              className="dust-particle" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 8}s`,
                opacity: Math.random()
              }}
            />
          ))}
        </div>

        {/* Mouse Spotlight Gradient */}
        <div 
          className="fixed pointer-events-none inset-0 z-10 transition-opacity duration-1000 hidden md:block"
          style={{
            background: `radial-gradient(600px at ${((mousePos.x + 0.5) * 100)}% ${((mousePos.y + 0.5) * 100)}%, rgba(201, 162, 39, 0.04), transparent 80%)`
          }}
        />

        {/* 1. Cinematic Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-card via-background to-background">
          <div className="container mx-auto px-6 relative z-20 flex flex-col md:flex-row items-center gap-12 pt-20 md:pt-0">
            
            {/* Hero Left Content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center space-x-2 bg-primary/10 backdrop-blur-sm border border-primary/20 px-4 py-2 rounded-full mb-6"
              >
                <Star className="text-primary w-4 h-4 fill-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-primary">New Bridal Collection 2026</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold leading-[1.05] mb-8">
                Elegance <br />
                <span className="text-gradient-gold italic font-normal">Redefined</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-md mx-auto md:mx-0 font-light leading-relaxed">
                Discover the epitome of luxury and timeless royal artistry. Handcrafted artificial jewellery that captures forever brilliance.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-12">
                <Link 
                  href="/shop" 
                  className="group relative inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <span className="relative text-xs font-semibold tracking-widest uppercase">Shop Collection</span>
                </Link>
                <Link 
                  href="/collections" 
                  className="group inline-flex items-center text-xs font-semibold tracking-widest uppercase hover:text-primary transition-colors py-3"
                >
                  View Lookbook
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border/50 max-w-lg mx-auto md:mx-0">
                <div className="text-center md:text-left">
                  <h4 className="font-playfair text-3xl font-bold text-primary">
                    <Counter value={10000} suffix="+" />
                  </h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Customers</p>
                </div>
                <div className="text-center md:text-left">
                  <h4 className="font-playfair text-3xl font-bold text-primary">
                    <Counter value={500} suffix="+" />
                  </h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Unique Designs</p>
                </div>
                <div className="text-center md:text-left">
                  <h4 className="font-playfair text-3xl font-bold text-primary">
                    <Counter value={4} suffix=".9★" />
                  </h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Rating</p>
                </div>
                <div className="text-center md:text-left">
                  <h4 className="font-playfair text-3xl font-bold text-primary">
                    <Counter value={100} suffix="%" />
                  </h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Quality</p>
                </div>
              </div>
            </div>

            {/* Hero Right Imagery - Product Spotlight */}
            <div className="flex-1 relative w-full h-[350px] md:h-[550px] flex items-center justify-center">
              <motion.div 
                className="relative w-72 h-72 md:w-96 md:h-96 rounded-full flex items-center justify-center"
                style={{
                  rotateY: mousePos.x * 25,
                  rotateX: -mousePos.y * 25,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Ambient Halo Ring behind item */}
                <div className="absolute inset-0 rounded-full bg-primary/5 border border-primary/10 blur-xl scale-110 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-primary/20 scale-95 opacity-50 pointer-events-none" />

                {/* Sparkling dots on coordinates */}
                <Sparkles className="sparkle-dot absolute top-10 left-12 text-primary w-4 h-4 opacity-50 pointer-events-none" />
                <Sparkles className="sparkle-dot absolute bottom-12 right-12 text-primary w-4 h-4 opacity-40 pointer-events-none" />

                <div className="relative w-full h-full animate-float select-none pointer-events-none">
                  <Image 
                    src="https://images.unsplash.com/photo-1599643478514-4a82a0b12bc5?auto=format&fit=crop&q=80&w=800"
                    alt="Luxury Diamond Choker Set"
                    fill
                    className="object-contain drop-shadow-[0_20px_40px_rgba(201,162,39,0.15)] filter brightness-[1.02]"
                    priority
                  />
                  {/* Sweep Light Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none mix-blend-overlay" />
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* Trust Badges Bar */}
        <section className="bg-secondary/40 py-8 border-y border-border/40 relative z-20">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center justify-center space-x-3">
              <Navigation className="w-5 h-5 text-primary" />
              <div>
                <h5 className="text-xs uppercase tracking-widest font-bold">Free Shipping</h5>
                <p className="text-[10px] text-muted-foreground">Complimentary express shipping</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Star className="w-5 h-5 text-primary" />
              <div>
                <h5 className="text-xs uppercase tracking-widest font-bold">2-Day Returns</h5>
                <p className="text-[10px] text-muted-foreground">Hassle-free luxury exchange</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <h5 className="text-xs uppercase tracking-widest font-bold">Premium Packaging</h5>
                <p className="text-[10px] text-muted-foreground">Velvet-lined legacy cases</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <h5 className="text-xs uppercase tracking-widest font-bold">Secure Checkout</h5>
                <p className="text-[10px] text-muted-foreground">SSL certified transactions</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Curated Collections Editorial Grid */}
        <FeaturedCollections collections={categories} />

        {/* 3. Storytelling Legacy Section */}
        <BrandStory />

        {/* 4. Full-Width Luxury Campaign (Ken Burns Zoom) */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1599643477873-1ef912f71625?auto=format&fit=crop&q=80&w=1200"
              alt="Luxury campaign backdrop"
              fill
              className="object-cover scale-105 filter brightness-[0.7]"
              style={{
                transition: "transform 10s ease-out"
              }}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          </div>

          <div className="container mx-auto px-6 relative z-20 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h3 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-8">
                “Crafted to celebrate <br />
                every <span className="text-gradient-gold italic font-normal">unforgettable</span> moment.”
              </h3>
              <p className="text-xs tracking-[0.35em] uppercase text-primary/80 font-bold">The Radhika Signature Campaign</p>
            </motion.div>
          </div>
        </section>

        {/* 5. Product Showcase (Trending Products) */}
        <TrendingSlider products={trendingProducts} />

        {/* 6. Premium Campaign Masonry Gallery */}
        <section className="py-32 bg-background border-t border-border/30">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
                The Luxury <span className="text-gradient-gold italic font-normal">Gallery</span>
              </h2>
              <p className="text-muted-foreground text-sm font-light">
                A visual journey through premium designs, editorial editorials, and details of bespoke packaging.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image 1 */}
              <div className="md:col-span-2 relative h-[400px] rounded-3xl overflow-hidden group bg-secondary/30">
                <Image 
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"
                  alt="Packaging details"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Heritage Cases</span>
                    <h4 className="text-xl text-white font-playfair font-bold mt-1">Velvet Premium Packing</h4>
                  </div>
                </div>
              </div>

              {/* Image 2 */}
              <div className="relative h-[400px] rounded-3xl overflow-hidden group bg-secondary/30">
                <Image 
                  src="https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600"
                  alt="Earrings details"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Earrings Collection</span>
                    <h4 className="text-xl text-white font-playfair font-bold mt-1">Royal Drop Settings</h4>
                  </div>
                </div>
              </div>

              {/* Image 3 */}
              <div className="relative h-[400px] rounded-3xl overflow-hidden group bg-secondary/30">
                <Image 
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600"
                  alt="Gold Rings detail"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Bridal Band Rings</span>
                    <h4 className="text-xl text-white font-playfair font-bold mt-1">22K Custom Gold Plating</h4>
                  </div>
                </div>
              </div>

              {/* Image 4 */}
              <div className="md:col-span-2 relative h-[400px] rounded-3xl overflow-hidden group bg-secondary/30">
                <Image 
                  src="https://images.unsplash.com/photo-1515562141207-7a8efbf69c76?auto=format&fit=crop&q=80&w=800"
                  alt="Lifestyle Model"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <div>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Bespoke Lifestyle</span>
                    <h4 className="text-xl text-white font-playfair font-bold mt-1">Timeless Portrait Lookbook</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Testimonials Review Carousel */}
        <section className="py-32 bg-secondary/20 border-y border-border/30 relative">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <Star className="text-primary w-10 h-10 fill-primary mx-auto mb-8 animate-pulse" />
            
            <div className="h-64 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="font-playfair text-xl md:text-2xl lg:text-3xl italic leading-relaxed text-foreground max-w-2xl mx-auto mb-8">
                    “{testimonials[activeTestimonial].comment}”
                  </p>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary">
                      <Image 
                        src={testimonials[activeTestimonial].avatar} 
                        alt={testimonials[activeTestimonial].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-sm text-foreground flex items-center">
                        {testimonials[activeTestimonial].name}
                        <span className="ml-2 text-[9px] uppercase bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">Verified Buyer</span>
                      </h4>
                      <p className="text-[10px] text-muted-foreground">{testimonials[activeTestimonial].location}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Dots navigation */}
            <div className="flex justify-center space-x-3 mt-12">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-8 bg-primary' : 'w-2.5 bg-primary/20'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 8. Newsletter Upgraded to 'Luxury Circle' */}
        <section className="py-32 bg-card text-card-foreground relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-5">
            <h2 className="font-playfair text-[18vw] font-bold whitespace-nowrap">Circle</h2>
          </div>

          <div className="container mx-auto px-6 relative z-10 max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] uppercase tracking-[0.35em] text-primary font-bold">RADHIKA EXCLUSIVES</span>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold mt-4 mb-6">Join our Luxury Circle</h2>
              <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-lg mx-auto mb-12">
                Subscribe to receive private preview sales, early access lookbooks, and luxury design collection alerts.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full pl-12 pr-4 py-4 rounded-full bg-background border border-border/80 focus:border-primary outline-none text-xs transition-colors"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-opacity cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}
