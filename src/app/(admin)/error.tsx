"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Panel Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-300">
      <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive shadow-xl">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          An error occurred while loading this admin section. Please try refreshing or return to the dashboard.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={reset}
          type="button"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <Link
          href="/admin"
          className="px-6 py-3 rounded-xl border border-border/60 hover:bg-secondary text-foreground font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
