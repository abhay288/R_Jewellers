"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, History } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCartStore } from "@/frontend/store/useCartStore";
import { useRecentlyViewedStore } from "@/frontend/store/useRecentlyViewedStore";
import SearchModal from "../shop/SearchModal";

export default function Navbar() {
  const { data: session } = useSession();
  const needsPhone = !!(session?.user && !(session.user as any).phone);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRecentlyViewedOpen, setIsRecentlyViewedOpen] = useState(false);
  const [isTextSearchOpen, setIsTextSearchOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const { items: recentlyViewedItems } = useRecentlyViewedStore();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 left-0 right-0 z-50 bg-background transition-shadow duration-300",
          isScrolled ? "shadow-md border-b border-border/10" : "shadow-xs border-b border-border/5"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Scroll Progress Bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left z-50"
          style={{ scaleX }}
        />

        {/* Main Navbar: h-22.5 */}
        <div className="container mx-auto px-6 flex items-center justify-between h-22.5">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-1 md:flex-none text-center md:text-left flex justify-center md:justify-start -ml-2">
            <Image 
              src="/assets/logo.png" 
              alt="Radhika Jewellers" 
              width={96} 
              height={96} 
              style={{ width: "auto", height: "auto" }}
              className="object-contain drop-shadow-sm w-20 h-20 md:w-24 md:h-24 mix-blend-multiply"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm tracking-wide text-foreground/80 hover:text-primary transition-colors uppercase font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-6 text-foreground">
            <button className="hover:text-primary transition-colors" onClick={() => setIsTextSearchOpen(true)} aria-label="Search products">
              <Search size={20} strokeWidth={1.5} />
            </button>
            {session?.user && (session.user as any).role === "admin" && (
              <Link 
                href="/admin" 
                className="hidden md:flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full hover:bg-amber-500 hover:text-black transition-all shadow-sm"
              >
                <span>Admin Panel</span>
              </Link>
            )}
            <Link href="/account" className="hidden md:block relative hover:text-primary transition-colors" aria-label="Go to account details">
              <User size={20} strokeWidth={1.5} />
              {needsPhone && (
                <span 
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse border-2 border-background" 
                  title="Add contact number to complete your profile"
                />
              )}
            </Link>
            <button className="hover:text-primary transition-colors" onClick={() => setIsRecentlyViewedOpen(true)} aria-label="Recently viewed items">
              <History size={20} strokeWidth={1.5} />
            </button>
            <Link href="/account/wishlist" className="hover:text-primary transition-colors" aria-label="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
            </Link>
            <button className="hover:text-primary transition-colors relative" onClick={toggleCart} aria-label="Shopping Cart">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation (desktop only, h-12.5) */}
        <div className="hidden md:block h-12.5 border-t border-border/10 bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-6 h-full flex items-center justify-center space-x-10 text-[11px] tracking-[0.25em] uppercase font-bold text-foreground/80">
            {[
              { name: "New Arrivals", href: "/shop?sort=newest" },
              { name: "Bridal", href: "/shop?collection=bridal" },
              { name: "Necklaces", href: "/shop?category=necklaces" },
              { name: "Earrings", href: "/shop?category=earrings" },
              { name: "Rings", href: "/shop?category=rings" },
              { name: "Bracelets", href: "/shop?category=bracelets" },
              { name: "Anklets", href: "/shop?category=anklets" },
              { name: "Gift Collection", href: "/shop?category=gift-collection" },
              { name: "Festival Collection", href: "/shop?collection=festival" }
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="relative py-3 group hover:text-primary transition-colors duration-300"
              >
                <span>{cat.name}</span>
                <span className="absolute bottom-1 left-0 w-full h-[1.5px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-60 bg-background/95 backdrop-blur-md flex flex-col"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Image 
                  src="/assets/logo.png" 
                  alt="Radhika Jewellers" 
                  width={100} 
                  height={100} 
                  className="object-contain w-20 h-20 mix-blend-multiply"
                />
              </Link>
              <button
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={28} />
              </button>
            </div>
            
            <nav className="flex flex-col items-center justify-center flex-1 space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-playfair text-3xl hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {session?.user && (session.user as any).role === "admin" && (
                <Link 
                  href="/admin" 
                  className="font-playfair text-3xl text-amber-500 hover:text-amber-400 transition-colors uppercase font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <div className="pt-8 flex items-center space-x-6">
                <Link href={session ? "/account" : "/login"} className="relative text-sm tracking-wide uppercase hover:text-primary flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>{session ? "My Account" : "Sign In"}</span>
                  {session && needsPhone && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse ml-1.5" title="Add contact number to complete profile" />
                  )}
                </Link>
                <Link href="/account/wishlist" className="text-sm tracking-wide uppercase hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recently Viewed Drawer */}
      <AnimatePresence>
        {isRecentlyViewedOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecentlyViewedOpen(false)}
            />
            {/* Panel */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border/50 shadow-2xl p-6 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex justify-between items-center pb-6 border-b border-border/50">
                <div>
                  <h3 className="font-playfair text-2xl font-semibold text-primary">Recently Viewed</h3>
                  <p className="text-xs text-muted-foreground mt-1">Your recently browsed luxury pieces</p>
                </div>
                <button
                  onClick={() => setIsRecentlyViewedOpen(false)}
                  className="text-foreground hover:text-primary transition-colors p-2"
                  aria-label="Close recently viewed drawer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {recentlyViewedItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                    <History size={40} className="stroke-1 mb-4 opacity-50" />
                    <p className="text-sm">No recently viewed items yet.</p>
                  </div>
                ) : (
                  recentlyViewedItems.map((product) => (
                    <Link
                      key={product._id}
                      href={`/product/${product.slug || product._id}`}
                      onClick={() => setIsRecentlyViewedOpen(false)}
                      className="flex items-center space-x-4 p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-all hover:bg-secondary/20"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-secondary shrink-0">
                        <Image
                          src={product.images?.[0] || "/assets/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate text-foreground">{product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                        <p className="text-sm font-medium text-primary mt-2">₹{product.finalPrice || product.price}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Text Search Modal */}
      <SearchModal isOpen={isTextSearchOpen} onClose={() => setIsTextSearchOpen(false)} />
    </>
  );
}
