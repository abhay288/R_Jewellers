import React from 'react';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 space-y-6 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        {/* Inner brand emblem */}
        <div className="absolute font-playfair font-bold text-amber-500 text-xs tracking-widest uppercase">
          RJ
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <span className="font-playfair font-bold text-sm text-foreground tracking-wider uppercase">Radhika Jewellers</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">Loading Luxury Catalog...</span>
      </div>

      {/* Grid Skeleton */}
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 opacity-40">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-64 bg-secondary/60 rounded-2xl animate-pulse" />
            <div className="h-4 bg-secondary/80 rounded-md w-3/4 animate-pulse" />
            <div className="h-4 bg-secondary/60 rounded-md w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
