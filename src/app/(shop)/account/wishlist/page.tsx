import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

// Mock Wishlist Data
const wishlistItems = [
  {
    id: "p3",
    name: "Classic Diamond Tennis Bracelet",
    price: "$499.00",
    category: "Everyday",
    image: "/images/product-3.jpg",
    inStock: true,
  },
  {
    id: "p5",
    name: "Temple Jewellery Gold Necklace",
    price: "$750.00",
    category: "Festive",
    image: "/images/product-5.jpg",
    inStock: false,
  }
];

export default function WishlistPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-playfair font-bold mb-6">My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6">Save your favorite pieces here to easily find them later.</p>
          <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity">
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group relative border border-border/50 rounded-2xl p-4 bg-background/50 hover:border-primary/50 transition-colors flex flex-col">
              
              <button className="absolute top-6 right-6 z-10 w-8 h-8 bg-background/80 backdrop-blur text-muted-foreground rounded-full flex items-center justify-center hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>

              <Link href={`/product/${item.id}`}>
                <div className="aspect-square rounded-xl bg-secondary overflow-hidden mb-4 relative flex items-center justify-center">
                  <span className="text-xs uppercase text-muted-foreground/50">Img</span>
                  {/* <Image src={item.image} fill className="object-cover" alt={item.name} /> */}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-background text-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">{item.category}</p>
                  <h3 className="font-playfair font-medium text-base mb-1 line-clamp-1">{item.name}</h3>
                  <p className="font-medium">{item.price}</p>
                </div>
              </Link>
              
              <button 
                disabled={!item.inStock}
                className="w-full mt-4 flex items-center justify-center space-x-2 border border-primary text-primary py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary cursor-pointer disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
