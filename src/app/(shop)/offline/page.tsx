"use client";

import Link from "next/link";
import { WifiOff, RotateCw } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full border border-border/50 rounded-3xl p-8 md:p-12 bg-card shadow-lg space-y-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <WifiOff className="w-8 h-8" />
        </div>
        
        <h1 className="font-playfair text-3xl font-bold tracking-tight">You are Offline</h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          It seems you have lost connection to the internet. Please check your network settings and try again.
        </p>

        <div className="w-full pt-4 flex flex-col gap-4">
          <button
            onClick={handleRetry}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium tracking-wider uppercase text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Retry Connection
          </button>
          
          <Link
            href="/"
            className="w-full border border-border/50 py-3 rounded-full font-medium tracking-wider uppercase text-xs hover:bg-secondary/50 transition-colors text-muted-foreground"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
