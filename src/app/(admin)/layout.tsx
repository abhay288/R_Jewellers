"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLoading from "./admin/loading";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ListTree,
  Warehouse,
  Undo2,
  TicketPercent,
  Star,
  Image as ImageIcon,
  LineChart,
  UserCircle,
  Mail,
  Check,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: PackageSearch },
  { name: "Categories", href: "/admin/categories", icon: ListTree },
  { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Returns", href: "/admin/returns", icon: Undo2 },
  { name: "Messages", href: "/admin/messages", icon: Mail },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Banner Management", href: "/admin/banners", icon: ImageIcon },
  { name: "Website Settings", href: "/admin/settings", icon: Settings },
  { name: "Analytics", href: "/admin/analytics", icon: LineChart },
  { name: "Profile", href: "/admin/profile", icon: UserCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin notifications:", err);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: session } = useSession();
  const adminName = session?.user?.name || "Admin User";
  const adminEmail = session?.user?.email || "admin@radhika.com";
  const initials = adminName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full bg-neutral-900/5 dark:bg-neutral-950 flex font-sans antialiased text-foreground overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed 100vh */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-xl border-r border-border/60 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 flex flex-col h-screen shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border/50 bg-secondary/30 shrink-0">
          <Link href="/admin" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-card border border-amber-500/20 p-1 shadow-md group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0 overflow-hidden">
              <Image 
                src="/assets/logo.png" 
                alt="Radhika Jewellers Logo" 
                width={44} 
                height={44} 
                className="object-contain w-full h-full mix-blend-multiply" 
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-playfair font-bold text-base tracking-wide text-foreground group-hover:text-primary transition-colors">Radhika</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-amber-600 dark:text-amber-400">Jewellers Admin</span>
            </div>
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            
            const hasUnreadStock = notifications.some(n => !n.isRead && n.type === "stock");
            const hasUnreadMessages = notifications.some(n => !n.isRead && n.type === "message");
            const hasUnreadReturns = notifications.some(n => !n.isRead && n.id.startsWith("return"));
            const hasUnreadOrders = notifications.some(n => !n.isRead && n.id.startsWith("order"));

            const showDot = (item.name === "Messages" && hasUnreadMessages) ||
                            (item.name === "Inventory" && hasUnreadStock) ||
                            (item.name === "Returns" && hasUnreadReturns) ||
                            (item.name === "Orders" && hasUnreadOrders);

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
                  isActive 
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 shadow-xs" 
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-1"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-500 rounded-r-full shadow-sm" />
                )}
                <item.icon className={cn(
                  "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="flex-1 truncate">{item.name}</span>
                {showDot && (
                  <span className={cn(
                    "w-2 h-2 rounded-full animate-pulse shadow-sm",
                    isActive ? "bg-amber-500" : "bg-amber-500/80"
                  )} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border/50 bg-secondary/20 shrink-0">
          <div className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-card border border-border/50 mb-3 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-gradient-gold text-black font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{adminName}</span>
              <span className="text-[10px] text-muted-foreground truncate">{adminEmail}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Dedicated Scroll */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-card/90 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 lg:px-8 shrink-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center bg-secondary/50 rounded-2xl px-4 py-2 border border-border/60 w-64 lg:w-96 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-2xs">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search products, orders, categories..." 
                className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentTime && (
              <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground bg-secondary/60 px-3.5 py-1.5 rounded-full border border-border/30">
                {currentTime}
              </span>
            )}
            
            {/* Dynamic Notifications Button */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse border border-card"></span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="p-4 border-b border-border/50 flex items-center justify-between bg-secondary/20">
                    <div className="flex items-center space-x-2">
                      <span className="font-playfair font-bold text-sm text-foreground">Recent Alerts</span>
                      {unreadCount > 0 && (
                        <span className="bg-primary/25 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-3 text-xs">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-primary hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button 
                          onClick={handleClearAll}
                          className="text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-border/50 max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => handleMarkAsRead(item.id)}
                          className={cn(
                            "p-4 transition-colors cursor-pointer hover:bg-secondary/40 flex items-start space-x-3",
                            !item.isRead ? "bg-primary/5" : ""
                          )}
                        >
                          <div className="mt-0.5">
                            {item.type === "stock" ? (
                              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            ) : item.type === "order" ? (
                              <div className="p-1 rounded-lg bg-green-500/10 text-green-500">
                                <ShoppingCart className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500">
                                <Mail className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn("text-xs truncate", !item.isRead ? "font-bold text-foreground" : "text-muted-foreground")}>
                                {item.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs md:hidden">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 min-h-0 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <Suspense fallback={<AdminLoading />}>
            {children}
          </Suspense>
        </div>

      </main>
    </div>
  );
}
