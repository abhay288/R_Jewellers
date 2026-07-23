import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="bg-card border border-border/60 p-6 md:p-8 rounded-3xl space-y-4">
        <div className="h-4 bg-amber-500/20 rounded-md w-32 animate-pulse" />
        <div className="h-8 bg-secondary/80 rounded-xl w-64 animate-pulse" />
        <div className="h-4 bg-secondary/60 rounded-md w-96 max-w-full animate-pulse" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-card border border-border/50 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-secondary/80 rounded-md w-24 animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 animate-pulse" />
            </div>
            <div className="h-8 bg-secondary/90 rounded-lg w-32 animate-pulse" />
            <div className="h-3 bg-secondary/60 rounded-md w-20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
        <div className="h-10 bg-secondary/50 rounded-xl w-full animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-secondary/30 rounded-xl w-full animate-pulse" />
        ))}
      </div>
    </div>
  );
}
