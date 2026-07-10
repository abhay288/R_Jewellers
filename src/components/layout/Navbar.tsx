"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();

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
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm py-4"
            : "bg-transparent py-6"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-1 md:flex-none text-center md:text-left flex justify-center md:justify-start -ml-2">
            <Image 
              src="/assets/logo.png" 
              alt="Radhika Jewellers" 
              width={120} 
              height={120} 
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
            <button className="hover:text-primary transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href="/account" className="hidden md:block hover:text-primary transition-colors">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <button className="hover:text-primary transition-colors">
              <Heart size={20} strokeWidth={1.5} />
            </button>
            <button className="hover:text-primary transition-colors relative" onClick={toggleCart}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
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
              <div className="pt-8 flex items-center space-x-6">
                <Link href="/login" className="text-sm tracking-wide uppercase hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/wishlist" className="text-sm tracking-wide uppercase hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
