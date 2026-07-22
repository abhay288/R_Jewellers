"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  const { data: session } = useSession();

  const userName = session?.user?.name || "Customer";

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-16 md:pb-24">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-1.5">My Account</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back, <span className="font-semibold text-foreground">{userName}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28">
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 hide-scrollbar">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const isProfileTab = item.href === "/account";
                const needsPhone = isProfileTab && session?.user && !(session.user as any).phone;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors whitespace-nowrap text-sm font-medium relative",
                      isActive 
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                    {needsPhone && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-auto" title="Add contact number to complete profile" />
                    )}
                  </Link>
                );
              })}
              
              <div className="hidden lg:block my-4 border-t border-border/50" />
              
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap text-left text-sm font-medium"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full bg-card border border-border/50 rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm min-h-125">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
