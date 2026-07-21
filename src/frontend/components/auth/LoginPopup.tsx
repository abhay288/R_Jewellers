"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

export default function LoginPopup({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const dismissed = sessionStorage.getItem("loginPopupDismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem("loginPopupDismissed", "true");
  }, []);

  // ESC key to close
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, handleClose]);

  if (isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px]"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 z-[999] w-[340px]"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in prompt"
          >
            {/* Card shell */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(145deg, #1a0f0a 0%, #2d1a0e 50%, #1a0f0a 100%)",
                border: "1px solid rgba(212,175,100,0.25)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,100,0.15)",
              }}
            >
              {/* Gold shimmer top border */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(212,175,100,0.8), rgba(255,215,100,1), rgba(212,175,100,0.8), transparent)",
                }}
              />

              {/* Decorative radial glow */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(212,175,100,0.12) 0%, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(180,120,60,0.1) 0%, transparent 70%)" }}
              />

              {/* Close button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="absolute top-4 right-4 z-20 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(212,175,100,0.2)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,175,100,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,100,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,100,0.2)";
                }}
                aria-label="Close"
              >
                <X size={13} color="rgba(212,175,100,0.8)" strokeWidth={2.5} />
              </button>

              {/* Content */}
              <div className="px-7 pt-8 pb-7">
                {/* Icon badge */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,175,100,0.25), rgba(180,140,60,0.15))",
                      border: "1px solid rgba(212,175,100,0.35)",
                    }}
                  >
                    <Sparkles size={14} style={{ color: "rgb(212,175,100)" }} />
                  </div>
                  <span
                    className="text-xs uppercase tracking-[0.2em] font-medium"
                    style={{ color: "rgba(212,175,100,0.7)" }}
                  >
                    Exclusive Access
                  </span>
                </div>

                {/* Headline */}
                <h3
                  className="text-2xl font-playfair font-bold mb-2 leading-tight"
                  style={{ color: "rgb(255,245,230)" }}
                >
                  Welcome to<br />Radhika Jewellers
                </h3>

                {/* Subtitle */}
                <p
                  className="text-sm mb-7 leading-relaxed"
                  style={{ color: "rgba(255,235,200,0.55)" }}
                >
                  Sign in to unlock your wishlist, track orders &amp; enjoy a luxury personalised experience.
                </p>

                {/* Action buttons */}
                <div className="flex gap-3 mb-4">
                  <Link
                    href="/login"
                    onClick={() => sessionStorage.setItem("loginPopupDismissed", "true")}
                    className="flex-1 py-2.5 rounded-full text-center text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, rgb(212,175,100), rgb(180,140,60))",
                      color: "#1a0f0a",
                      boxShadow: "0 4px 20px rgba(212,175,100,0.3)",
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => sessionStorage.setItem("loginPopupDismissed", "true")}
                    className="flex-1 py-2.5 rounded-full text-center text-sm font-medium transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(212,175,100,0.25)",
                      color: "rgba(255,235,200,0.8)",
                    }}
                  >
                    Register
                  </Link>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(212,175,100,0.12)" }} />
                  <span className="text-xs" style={{ color: "rgba(255,235,200,0.3)" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(212,175,100,0.12)" }} />
                </div>

                {/* Google button */}
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem("loginPopupDismissed", "true");
                    signIn("google", { callbackUrl: "/" });
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(212,175,100,0.2)",
                    color: "rgba(255,235,200,0.75)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,100,0.4)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,100,0.2)";
                  }}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* ESC hint */}
                <p className="text-center mt-4 text-xs" style={{ color: "rgba(255,235,200,0.2)" }}>
                  Press <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>ESC</kbd> to dismiss
                </p>
              </div>

              {/* Gold bottom border */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(212,175,100,0.3), transparent)",
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
