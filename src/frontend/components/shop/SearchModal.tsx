"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight, Sparkles, ShoppingBag, Mic, MicOff, Volume2 } from "lucide-react";

interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  finalPrice: number;
  image: string | null;
  category: string;
  inStock: boolean;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_KEYWORDS = [
  "Bridal Sets",
  "Kundan Earrings",
  "Necklace",
  "Gold Bangle",
  "Royal Ring",
  "Anklets",
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSuggestions([]);
      stopVoiceSearch();
    }
  }, [isOpen]);

  // Initialize SpeechRecognition API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceSupported(false);
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceMessage("Listening... Speak now");
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");

          setQuery(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          setVoiceMessage("Could not capture speech. Please try again.");
          setTimeout(() => setVoiceMessage(null), 3000);
        };

        recognition.onend = () => {
          setIsListening(false);
          setVoiceMessage(null);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceSearch = () => {
    if (!voiceSupported) {
      setVoiceMessage("Voice search is not supported in this browser.");
      setTimeout(() => setVoiceMessage(null), 3500);
      return;
    }

    if (isListening) {
      stopVoiceSearch();
    } else {
      startVoiceSearch();
    }
  };

  const startVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        setVoiceMessage("Listening... Speak now");
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start voice recognition:", err);
      }
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Failed to stop voice recognition:", err);
      }
    }
    setIsListening(false);
  };

  // Debounced search recommendations as user types or speaks
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/shop/search/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Failed to fetch search suggestions:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      stopVoiceSearch();
      onClose();
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    stopVoiceSearch();
    onClose();
    router.push(`/shop?search=${encodeURIComponent(keyword)}`);
  };

  const handleSuggestionClick = (slug: string) => {
    stopVoiceSearch();
    onClose();
    router.push(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 inset-x-4 sm:top-12 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-60 max-w-2xl w-full bg-card/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden p-6 sm:p-8"
          >
            {/* Golden luxury top bar indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500/60 to-transparent" />

            {/* Header / Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
              <div className="relative flex-1 flex items-center bg-secondary/30 border border-amber-500/30 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-full transition-all duration-300 shadow-sm">
                <Search className="w-5 h-5 text-amber-500 absolute left-4 pointer-events-none" />
                
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jewellery by name, category, or style..."
                  className="w-full bg-transparent pl-12 pr-24 py-4 text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />

                {/* Input Action Controls (Clear, Loading, Voice Mic) */}
                <div className="absolute right-3 flex items-center space-x-1.5">
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500 mr-1" />
                  )}

                  {query && !loading && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Clear input"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Voice Search Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceSearch}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/40"
                        : "text-amber-500/80 hover:text-amber-500 hover:bg-amber-500/10"
                    }`}
                    title={isListening ? "Stop voice search" : "Search by voice"}
                    aria-label="Voice search"
                  >
                    {isListening ? (
                      <Volume2 className="w-4 h-4 animate-bounce" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={onClose}
                className="ml-3.5 p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
                aria-label="Close search modal"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Voice Status Indicator Banner */}
            <AnimatePresence>
              {(isListening || voiceMessage) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div
                    className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold ${
                      isListening
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse"
                        : "bg-secondary border border-border/50 text-muted-foreground"
                    }`}
                  >
                    <Mic className={`w-3.5 h-3.5 ${isListening ? "text-amber-500 animate-pulse" : ""}`} />
                    <span>{voiceMessage || "Listening to your voice..."}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="max-h-[58vh] overflow-y-auto custom-scrollbar pr-1">
              
              {/* Live Recommendations */}
              {query.trim() && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500 flex items-center font-playfair">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                      Product Recommendations ({suggestions.length})
                    </span>
                    {suggestions.length > 0 && (
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs font-semibold text-primary hover:underline flex items-center transition-colors"
                      >
                        View all results <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2.5" />
                      <span className="text-xs font-medium">Searching Radhika Catalogue...</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                      <p className="text-sm font-semibold text-foreground">No matching jewellery found</p>
                      <p className="text-xs mt-1">Try searching for &quot;Necklace&quot;, &quot;Earrings&quot;, or &quot;Bridal&quot;</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSuggestionClick(item.slug)}
                          className="flex items-center space-x-3.5 p-3 rounded-2xl border border-border/40 hover:border-amber-500/50 hover:bg-secondary/40 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <div className="relative w-14 h-14 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border/30">
                            <Image
                              src={item.image || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400"}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-amber-500 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground capitalize truncate mt-0.5 font-medium">
                              {item.category}
                            </p>
                            <p className="text-xs font-bold text-amber-500 mt-1">
                              ₹{item.finalPrice}
                              {item.price > item.finalPrice && (
                                <span className="text-[10px] text-muted-foreground line-through ml-1.5 font-normal">
                                  ₹{item.price}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Default State: Popular Keywords & Quick Categories */}
              {!query.trim() && (
                <div className="space-y-6 py-2">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-3.5 font-playfair">
                      Popular Searches
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {POPULAR_KEYWORDS.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleKeywordClick(kw)}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/30 transition-all duration-300 shadow-sm"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-5">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-3.5 font-playfair">
                      Quick Categories
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: "Earrings", href: "/shop?category=earrings" },
                        { label: "Necklaces", href: "/shop?category=necklaces" },
                        { label: "Rings", href: "/shop?category=rings" },
                        { label: "Bangles", href: "/shop?category=bracelets" },
                        { label: "Bridal Sets", href: "/shop?collection=bridal" },
                        { label: "New Arrivals", href: "/shop?sort=newest" },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={onClose}
                          className="px-3.5 py-2.5 rounded-2xl border border-border/40 text-xs font-semibold text-foreground hover:border-amber-500/60 hover:text-amber-500 hover:bg-secondary/40 transition-all duration-300 flex items-center justify-between group shadow-sm"
                        >
                          <span>{item.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-500" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
