import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight } from "lucide-react";

// Mock Orders Data
const orders = [
  {
    id: "ORD-2026-8492",
    date: "July 02, 2026",
    status: "Delivered",
    total: "₹1,048.00",
    items: [
      { name: "Royal Kundan Bridal Choker Set", image: "https://images.unsplash.com/photo-1599643477873-1ef912f71625?auto=format&fit=crop&q=80&w=400", qty: 1 },
      { name: "Rose Gold Diamond Bangles", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400", qty: 1 }
    ]
  },
  {
    id: "ORD-2026-3821",
    date: "June 15, 2026",
    status: "Processing",
    total: "₹299.00",
    items: [
      { name: "Emerald Drop Earrings", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=400", qty: 2 }
    ]
  }
];

export default function OrdersPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-playfair font-bold mb-6">Order History</h2>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Looks like you haven't made any purchases.</p>
          <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-border/50 rounded-2xl p-6 bg-background/50 hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-6 border-b border-border/50 gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-bold">{order.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                </div>
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                  <span className="font-bold text-lg">{order.total}</span>
                  <button className="text-sm text-primary font-medium hover:underline flex items-center">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden shrink-0 relative">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1 max-w-[150px]">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
