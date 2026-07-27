"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings, Check, X } from "lucide-react";
import { useCookieConsent } from "@/frontend/context/CookieConsentContext";

export default function CookieConsentBanner() {
  const { consent, isBannerVisible, hasHydrated, acceptAll, rejectNonEssential, openModal } =
    useCookieConsent();

  if (!hasHydrated || !isBannerVisible || consent.granted) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto bg-neutral-900/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl shadow-2xl p-5 sm:p-7 pointer-events-auto text-neutral-100 font-sans relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Content Left */}
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 hidden sm:flex">
                <Cookie className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-amber-400 sm:hidden" />
                  <h3 className="font-playfair font-bold text-base sm:text-lg text-amber-100">
                    We Value Your Privacy & Security
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-4xl">
                  Radhika Jewellers uses cookies to ensure basic website functionality, protect your cart and checkout,
                  analyze site traffic, and personalize your luxury jewellery browsing experience. In compliance with GDPR,
                  ePrivacy, and CCPA, non-essential cookies are only enabled with your consent.
                </p>
              </div>
            </div>

            {/* Buttons Right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={openModal}
                type="button"
                className="px-5 py-3 rounded-xl border border-neutral-700 hover:border-amber-500/50 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 hover:text-amber-200 text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Customize</span>
              </button>

              <button
                onClick={rejectNonEssential}
                type="button"
                className="px-5 py-3 rounded-xl border border-neutral-700 hover:border-neutral-500 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Reject Non-Essential</span>
              </button>

              <button
                onClick={acceptAll}
                type="button"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Accept All</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
