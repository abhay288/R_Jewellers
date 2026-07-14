"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, LogOut, Settings } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  { name: "My Profile", href: "/account", icon: User },
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

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6">
        
        <div className="mb-12">
          <h1 className="text-4xl font-playfair font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Welcome back, Radhika Sharma</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 hide-scrollbar">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap",
                      isActive 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="hidden lg:block my-4 border-t border-border/50" />
              
              <button className="flex items-center space-x-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap text-left">
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-card border border-border/50 rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm min-h-[500px]">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
