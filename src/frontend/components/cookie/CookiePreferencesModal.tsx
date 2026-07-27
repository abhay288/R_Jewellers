"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, BarChart3, Target, UserCheck, SlidersHorizontal, Check, Lock } from "lucide-react";
import { useCookieConsent } from "@/frontend/context/CookieConsentContext";
import { ConsentCategories } from "@/shared/lib/cookieConsent";

export default function CookiePreferencesModal() {
  const { consent, isModalOpen, closeModal, savePreferences, acceptAll } = useCookieConsent();
  const modalRef = useRef<HTMLDivElement>(null);

  const [tempCategories, setTempCategories] = useState<ConsentCategories>(consent.categories);

  useEffect(() => {
    if (isModalOpen) {
      setTempCategories(consent.categories);
    }
  }, [isModalOpen, consent.categories]);

  // Trap focus and close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeModal]);

  const handleToggle = (key: keyof ConsentCategories) => {
    if (key === "necessary") return; // Locked
    setTempCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    savePreferences(tempCategories);
  };

  if (!isModalOpen) return null;

  const categoriesConfig: Array<{
    key: keyof ConsentCategories;
    title: string;
    description: string;
    examples: string[];
    icon: React.ComponentType<{ className?: string }>;
    locked?: boolean;
  }> = [
    {
      key: "necessary",
      title: "Necessary Cookies",
      description: "Essential cookies required for the website to function safely and correctly. They handle authentication, user session persistence, shopping cart state, secure checkout, CSRF protection, and security.",
      examples: ["Authentication Tokens", "Session Management", "Shopping Cart State", "Checkout Security", "CSRF Defense"],
      icon: ShieldCheck,
      locked: true,
    },
    {
      key: "analytics",
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our online store by collecting anonymous usage statistics and page performance measurements.",
      examples: ["Google Analytics", "Vercel Analytics", "Microsoft Clarity", "Performance Metrics"],
      icon: BarChart3,
    },
    {
      key: "marketing",
      title: "Marketing & Advertising Cookies",
      description: "Used to track visitors across websites to display relevant advertisement campaigns, personalized promotions, and measure ad campaign performance.",
      examples: ["Meta Pixel (Facebook)", "Google Ads Conversion", "Remarketing Tags", "Ad Targeted Cookies"],
      icon: Target,
    },
    {
      key: "personalization",
      title: "Personalization Cookies",
      description: "Enable the website to remember your personal choices and preferences (such as preferred currency or layout) to provide an enhanced user experience.",
      examples: ["Preferred Currency", "Saved Wishlist Filters", "Custom Theme Preferences"],
      icon: UserCheck,
    },
    {
      key: "functional",
      title: "Functional Cookies",
      description: "Support enhanced interactivity and features on the website, such as live chat support, product recommendation engines, and recently viewed jewellery items.",
      examples: ["Live Chat Widget", "Recently Viewed Products", "Smart Product Recommendations"],
      icon: SlidersHorizontal,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog Card */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-neutral-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 text-neutral-100 font-sans"
        >
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 w-full bg-linear-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Modal Header */}
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 backdrop-blur-md sticky top-0 z-20">
            <div>
              <h2 id="cookie-preferences-title" className="font-playfair text-xl sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
                Cookie Preferences
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Customize your privacy choices for Radhika Jewellers. You can update these settings anytime.
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Category List */}
          <div className="px-6 py-6 sm:px-8 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
            {categoriesConfig.map((cat) => {
              const Icon = cat.icon;
              const isEnabled = cat.locked ? true : tempCategories[cat.key];

              return (
                <div
                  key={cat.key}
                  className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base text-neutral-100">{cat.title}</h3>
                          {cat.locked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Lock className="w-3 h-3" /> Always Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      disabled={cat.locked}
                      onClick={() => handleToggle(cat.key)}
                      aria-pressed={isEnabled}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                        cat.locked
                          ? "opacity-60 cursor-not-allowed bg-amber-600"
                          : isEnabled
                          ? "bg-amber-500"
                          : "bg-neutral-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      >
                        {isEnabled && <Check className="w-3 h-3 text-neutral-900" />}
                      </span>
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed pl-12">{cat.description}</p>

                  <div className="pl-12 flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-neutral-500 font-medium">Examples:</span>
                    {cat.examples.map((ex, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 py-4 sm:px-8 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
            <button
              onClick={() => {
                acceptAll();
              }}
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold tracking-wider transition-colors cursor-pointer"
            >
              Allow All Categories
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={closeModal}
                type="button"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                type="button"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
