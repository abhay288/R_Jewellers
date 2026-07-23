import React from 'react';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pt-10 pb-20 animate-in fade-in duration-150">
      
      {/* Top Luxury Progress Line */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-amber-500/20 overflow-hidden">
        <div className="h-full bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 animate-pulse w-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Subtle Brand Header Indicator */}
        <div className="flex items-center space-x-3 border-b border-border/40 pb-4">
          <div className="w-8 h-8 rounded-full border border-amber-500/40 flex items-center justify-center font-playfair font-bold text-[10px] text-amber-500">
            RJ
          </div>
          <div className="space-y-0.5">
            <h4 className="font-playfair font-bold text-xs uppercase tracking-wider text-foreground">Radhika Jewellers</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Loading Collection...</p>
          </div>
        </div>

        {/* Product Cards Shimmer Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card border border-border/40 rounded-3xl p-4 space-y-3 shadow-xs">
              <div className="aspect-square bg-secondary/50 rounded-2xl animate-pulse" />
              <div className="h-3.5 bg-secondary/70 rounded-md w-3/4 animate-pulse" />
              <div className="h-3 bg-secondary/50 rounded-md w-1/2 animate-pulse" />
              <div className="h-4 bg-amber-500/20 rounded-md w-1/3 animate-pulse pt-2" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
