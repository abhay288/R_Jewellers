"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-secondary/30 flex">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border/50">
          <Link href="/admin" className="flex flex-col -ml-4">
            <Image 
              src="/assets/logo.png" 
              alt="Radhika Jewellers" 
              width={240} 
              height={100} 
              className="object-contain h-auto w-auto max-h-20 mix-blend-multiply"
            />
          </Link>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{adminName}</span>
              <span className="text-xs text-muted-foreground truncate">{adminEmail}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-20 bg-card border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center bg-secondary/50 rounded-full px-4 py-2 border border-border/50 w-64 lg:w-96 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none outline-none text-sm w-full"
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
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>

      </main>
    </div>
  );
}
