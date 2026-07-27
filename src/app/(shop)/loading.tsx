import React from 'react';
import { Sparkles, Crown } from 'lucide-react';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pt-12 pb-24 animate-in fade-in duration-200">
      
      {/* Top Luxury Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-amber-500/10 overflow-hidden">
        <div className="h-full bg-linear-to-r from-amber-300 via-amber-500 to-yellow-600 animate-[pulse_1.5s_infinite] w-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 space-y-10 max-w-7xl">
        
        {/* Luxury Brand Preloader Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-500/20 pb-6 gap-4">
          <div className="flex items-center space-x-4">
            
            {/* Spinning Golden Seal */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/50 animate-[spin_10s_linear_infinite]" />
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-500/20 via-neutral-900 to-amber-900/40 border border-amber-500/60 shadow-md flex items-center justify-center">
                <span className="font-playfair font-black text-xs text-amber-400 tracking-wider">RJ</span>
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <h4 className="font-playfair font-bold text-sm uppercase tracking-[0.25em] text-foreground">
                  Radhika Jewellers
                </h4>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <p className="text-[11px] text-amber-500 font-medium tracking-[0.25em] uppercase">
                  Curating Luxury Collection...
                </p>
              </div>
            </div>
          </div>

          {/* Shimmer Badge Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span className="tracking-wider uppercase text-[10px]">Fine Jewelry</span>
          </div>
        </div>

        {/* Product Cards Luxury Shimmer Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card/80 border border-amber-500/10 rounded-3xl p-4 space-y-3.5 shadow-sm relative overflow-hidden">
              <div className="aspect-square bg-secondary/60 rounded-2xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-500/10 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
              <div className="h-4 bg-secondary/80 rounded-lg w-3/4 animate-pulse" />
              <div className="h-3 bg-secondary/50 rounded-md w-1/2 animate-pulse" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-4 bg-amber-500/25 rounded-md w-1/3 animate-pulse" />
                <div className="h-6 w-6 rounded-full bg-amber-500/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
