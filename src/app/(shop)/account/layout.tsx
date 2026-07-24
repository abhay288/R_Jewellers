"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User, Package, Heart, MapPin, LogOut, Settings, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  { name: "My Profile", href: "/account", icon: User },
  { name: "Saved Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Order History", href: "/account/orders", icon: Package },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
  { name: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "Valued Customer";
  const userEmail = session?.user?.email || "";

  return (
    <div className="min-h-screen bg-background pt-4 md:pt-6 pb-16 md:pb-20">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Luxury Account Header Banner */}
        <div className="bg-secondary/40 border border-border/50 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-amber-500 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] font-playfair">Royal Privileges Member</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-foreground">
              Welcome back, {userName}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{userEmail}</p>
          </div>

          <div className="relative z-10 flex items-center space-x-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
            >
              Explore Catalogue →
            </Link>
          </div>
        </div>

        {/* Sidebar & Content Layout - Perfectly Aligned Top Baseline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Navigation (3 cols) */}
          <aside className="lg:col-span-3 w-full shrink-0">
            <nav className="bg-card border border-border/50 rounded-3xl p-3 md:p-4 shadow-sm flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 hide-scrollbar">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const isProfileTab = item.href === "/account";
                const needsPhone = isProfileTab && session?.user && !(session.user as any).phone;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap text-xs font-semibold uppercase tracking-wider relative cursor-pointer",
                      isActive 
                        ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20" 
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                    {needsPhone && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 border border-white animate-pulse ml-auto" title="Add contact number to complete profile" />
                    )}
                  </Link>
                );
              })}
              
              <div className="hidden lg:block my-2 border-t border-border/40" />
              
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area (9 cols) */}
          <main className="lg:col-span-9 w-full bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm min-h-125">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
}
