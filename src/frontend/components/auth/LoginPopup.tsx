"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPopup({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show for unauthenticated users who haven't dismissed the popup in this session
    if (!isAuthenticated) {
      const dismissed = sessionStorage.getItem("loginPopupDismissed");
      if (!dismissed) {
        // Slight delay to not be too aggressive on page load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("loginPopupDismissed", "true");
  };

  if (isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 w-full max-w-sm"
        >
          <div className="bg-card border border-border/50 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-secondary/50 p-1.5 rounded-full transition-colors z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="pr-8 relative z-10">
              <h3 className="font-playfair text-2xl font-bold mb-2">Welcome Back</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Log in to view your wishlist, track orders, and enjoy a seamless personalized shopping experience.
              </p>
              
              <div className="flex gap-3">
                <Link 
                  href="/login"
                  onClick={() => sessionStorage.setItem("loginPopupDismissed", "true")}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium uppercase tracking-wide hover:opacity-90 transition-opacity text-center flex-1"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup"
                  onClick={() => sessionStorage.setItem("loginPopupDismissed", "true")}
                  className="bg-secondary text-secondary-foreground border border-border/50 px-6 py-2.5 rounded-full text-sm font-medium uppercase tracking-wide hover:bg-secondary/80 transition-colors text-center flex-1"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
