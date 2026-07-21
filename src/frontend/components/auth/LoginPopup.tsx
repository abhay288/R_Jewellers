"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

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
          <div className="bg-card border border-border/50 shadow-2xl rounded-2xl p-6 relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            {/* Close button — outside overflow-hidden so it's always clickable */}
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground hover:bg-secondary/80 p-1.5 rounded-full transition-colors z-20"
              aria-label="Close login popup"
            >
              <X size={18} />
            </button>

            <div className="pr-8 relative z-10">
              <h3 className="font-playfair text-2xl font-bold mb-2">Welcome Back</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Log in to view your wishlist, track orders, and enjoy a seamless personalized shopping experience.
              </p>
              
              <div className="flex gap-3 mb-4">
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

              {/* Google Sign In */}
              <button
                onClick={() => {
                  sessionStorage.setItem("loginPopupDismissed", "true");
                  signIn("google", { callbackUrl: "/" });
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-border/50 rounded-full hover:bg-secondary/50 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
