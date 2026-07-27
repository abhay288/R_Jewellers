import Link from "next/link";
import { FileQuestion, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-300">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl">
        <FileQuestion className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Admin Item Not Found
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The admin page, product, or order record you are looking for does not exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link
          href="/admin"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
