"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Share2, Star, Truck, ShieldCheck, Award, RotateCcw, 
  Check, ChevronRight, MapPin, Sparkles, ShoppingBag, Lock, 
  X, Plus, Minus, Maximize2, Copy, Send
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCartStore } from "@/frontend/store/useCartStore";
import { useWishlistStore } from "@/frontend/store/useWishlistStore";
import { useRecentlyViewedStore } from "@/frontend/store/useRecentlyViewedStore";

interface ProductClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const router = useRouter();

  // State
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<{
    dateRange?: string;
    isCodAvailable?: boolean;
    courier?: string;
    error?: string;
  } | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Local reviews array
  const [localReviews, setLocalReviews] = useState([
    {
      id: "r1",
      author: "Priya Sharma",
      date: "12 Jun 2026",
      rating: 5,
      comment: "Absolutely breathtaking craftsmanship! The gold plating finish and Kundan setting look 100% authentic. Received so many compliments at my sister's wedding.",
      verified: true
    },
    {
      id: "r2",
      author: "Anjali Gupta",
      date: "01 Jul 2026",
      rating: 5,
      comment: "Extremely high quality and velvet-lined packaging. Arrived within 3 days. Very heavy and royal feel!",
      verified: true
    },
    {
      id: "r3",
      author: "Kavita Verma",
      date: "15 Jul 2026",
      rating: 4,
      comment: "Stunning piece! Exactly like shown in pictures. Skin safe and lightweight to wear all evening.",
      verified: true
    }
  ]);

  // Stores
  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { addItem: addRecentlyViewed } = useRecentlyViewedStore();

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  // Calculate pricing & discount
  const price = product.price || 0;
  const mrp = product.mrp || Math.round(price * 1.3);
  const finalPrice = product.finalPrice || price;
  const savings = Math.max(0, mrp - finalPrice);
  const discountPercent = product.discount || (mrp > finalPrice ? Math.round(((mrp - finalPrice) / mrp) * 100) : 0);

  // Fallback product images
  const fallbackImage = 
    product.name?.toLowerCase().includes('earring') ? "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800" :
    product.name?.toLowerCase().includes('neck') ? "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" :
    product.name?.toLowerCase().includes('ring') ? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" :
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800";

  const images = product.images && product.images.length > 0 && product.images[0] ? product.images : [fallbackImage];

  // Automatically slide product hero gallery every 3.5 seconds if multiple images exist
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: finalPrice,
      image: images[0],
      quantity: quantity,
      category: product.category?.toString() || "Jewellery"
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  // Pincode Delivery Estimator logic
  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 6) {
      setDeliveryInfo({ error: "Please enter a valid 6-digit Indian Pincode." });
      return;
    }

    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      
      // Calculate realistic delivery date range based on pincode prefix
      const isMetro = ['11', '40', '56', '60', '70', '50'].some(prefix => pincode.startsWith(prefix));
      const daysMin = isMetro ? 2 : 4;
      const daysMax = isMetro ? 3 : 5;

      const minDate = new Date(Date.now() + daysMin * 24 * 60 * 60 * 1000);
      const maxDate = new Date(Date.now() + daysMax * 24 * 60 * 60 * 1000);

      const minFormatted = minDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      const maxFormatted = maxDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

      setDeliveryInfo({
        dateRange: `${minFormatted} - ${maxFormatted}`,
        isCodAvailable: true,
        courier: isMetro ? 'BlueDart Express (Air Cargo)' : 'Shiprocket Insured Surface Courier'
      });
    }, 600);
  };

  // Social Share links
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `Check out this gorgeous ${product.name} at Radhika Jewellers`;

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(currentUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}: ${currentUrl}`)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const sharePinterest = () => {
    window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(images[0])}&description=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const handleWriteReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    const newRev = {
      id: `r-${Date.now()}`,
      author: reviewName,
      date: "Just now",
      rating: reviewRating,
      comment: reviewComment,
      verified: true
    };

    setLocalReviews([newRev, ...localReviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setIsReviewModalOpen(false);
      setReviewSubmitted(false);
      setReviewName("");
      setReviewComment("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-6 md:pt-8 pb-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-60 bg-amber-500 text-black font-semibold text-xs px-5 py-3 rounded-full shadow-2xl flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Product link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 md:px-6">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8 overflow-x-auto hide-scrollbar py-1">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-amber-500 transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category?.name || product.category || 'all')}`} className="hover:text-amber-500 transition-colors">
            {product.category?.name || product.category || 'Jewellery'}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* Left Column: Image & Media Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 md:gap-6">
            
            {/* Thumbnail Carousel Slider */}
            <div className="flex md:flex-col gap-3 md:w-24 overflow-x-auto md:overflow-y-auto max-h-137.5 hide-scrollbar pb-2 md:pb-0">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative w-20 h-24 md:w-full md:h-28 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 shadow-sm",
                    activeImage === idx ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border/40 opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`${product.name} View ${idx + 1}`} fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage View Display */}
            <div className="flex-1 relative aspect-4/5 bg-secondary/30 rounded-3xl border border-border/40 overflow-hidden group shadow-lg">
              <Image
                src={images[activeImage] || fallbackImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                onClick={() => setIsFullscreen(true)}
              />

              {/* Badges on Gallery Stage */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                {discountPercent > 0 && (
                  <span className="bg-amber-500 text-black font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/30 font-semibold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    NEW ARRIVAL
                  </span>
                )}
              </div>

              {/* Expand / Fullscreen Button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-amber-500 hover:text-black transition-colors shadow-md z-10"
                aria-label="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Information & Buying Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              
              {/* Brand & Collection Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500 font-playfair">
                  {product.brand || "Radhika Jewellers"}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  SKU: {product.sku || product._id?.toString().substring(0, 8)}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground leading-tight mb-3">
                {product.name}
              </h1>

              {/* Ratings Summary Bar */}
              <div className="flex items-center space-x-3 mb-5">
                <div className="flex items-center bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  <span className="text-xs font-bold text-amber-500 mr-1.5">{product.averageRating || 4.8}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  ({product.reviewCount || localReviews.length} Verified Ratings)
                </span>
              </div>

              {/* Price & Savings Container */}
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-bold text-amber-500 font-playfair">
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </span>
                  {mrp > finalPrice && (
                    <span className="text-lg text-muted-foreground line-through font-normal">
                      ₹{mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                    You save ₹{savings.toLocaleString('en-IN')} on this order
                  </p>
                )}

                <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/40 pt-2 flex items-center justify-between">
                  <span>Inclusive of all taxes & GST charges</span>
                  <span className="font-semibold text-foreground">Free Shipping</span>
                </p>
              </div>

              {/* Special Offers Banner */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 mb-6 flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-foreground">Available Offers</p>
                  <p className="text-muted-foreground mt-0.5">
                    • Extra 10% instant discount on UPI/Cards checkout.<br />
                    • Complimentary velvet jewellery box with this purchase.
                  </p>
                </div>
              </div>

              {/* Delivery Date Estimator based on Pincode */}
              <div className="mb-6 bg-secondary/20 border border-border/50 rounded-2xl p-4">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Pincode Delivery Estimator
                </label>
                <form onSubmit={handlePincodeCheck} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit Pincode (e.g. 711106)"
                    className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isCheckingPincode}
                    className="px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all shrink-0 cursor-pointer"
                  >
                    {isCheckingPincode ? 'Checking...' : 'Check'}
                  </button>
                </form>

                {deliveryInfo && (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                    {deliveryInfo.error ? (
                      <p className="text-xs font-medium text-red-500">{deliveryInfo.error}</p>
                    ) : (
                      <>
                        <div className="flex items-center text-xs font-semibold text-green-600 dark:text-green-400">
                          <Truck className="w-4 h-4 mr-1.5 text-amber-500" />
                          <span>Estimated Delivery: {deliveryInfo.dateRange}</span>
                        </div>
                        {deliveryInfo.isCodAvailable && (
                          <div className="flex items-center text-[11px] text-muted-foreground font-medium pl-5">
                            <Check className="w-3.5 h-3.5 text-green-500 mr-1" />
                            <span>Cash on Delivery (COD) Available</span>
                          </div>
                        )}
                        {deliveryInfo.courier && (
                          <p className="text-[10px] text-muted-foreground pl-5 italic">
                            Dispatched via {deliveryInfo.courier} with Transit Insurance.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Selector & Stock Status */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Qty:</span>
                  <div className="flex items-center border border-border/60 rounded-xl bg-secondary/30 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Status Indicator */}
                <div>
                  {product.stock > 5 ? (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                      In Stock (Ready to Ship)
                    </span>
                  ) : product.stock > 0 ? (
                    <span className="text-xs font-semibold text-amber-500 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                      Low Stock (Only {product.stock} left!)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-red-500 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Action Buttons (Add to Cart & Buy Now) */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={cn(
                    "flex-1 h-13 rounded-full font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer",
                    product.stock > 0
                      ? "bg-secondary text-foreground border border-border/80 hover:border-amber-500 hover:text-amber-500"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className={cn(
                    "flex-1 h-13 rounded-full font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer",
                    product.stock > 0
                      ? "bg-amber-500 text-black hover:bg-amber-400"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Lock className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={cn(
                    "w-13 h-13 rounded-full border border-border/80 flex items-center justify-center transition-colors shrink-0 cursor-pointer",
                    wishlistItems.includes(product._id)
                      ? "text-red-500 border-red-500/50 bg-red-500/10"
                      : "text-foreground hover:border-amber-500 hover:text-amber-500"
                  )}
                  aria-label="Wishlist"
                >
                  <Heart className={cn("w-5 h-5", wishlistItems.includes(product._id) && "fill-current")} />
                </button>

                {/* Share Button (Opens Social Share Modal) */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-13 h-13 rounded-full border border-border/80 flex items-center justify-center text-foreground hover:border-amber-500 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
                  aria-label="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Trust Assurance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-t border-border/40">
              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>100% Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Gold Plating Warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                <span>48h Easy Returns</span>
              </div>
            </div>

          </div>

        </div>

        {/* Specifications & Care Tabs */}
        <div className="mt-16 pt-10 border-t border-border/40">
          <div className="flex border-b border-border/40 overflow-x-auto whitespace-nowrap hide-scrollbar gap-8 mb-8">
            {[
              { id: "description", label: "Description" },
              { id: "specs", label: "Specifications" },
              { id: "care", label: "Jewellery Care" },
              { id: "shipping", label: "Shipping & Returns" },
              { id: "reviews", label: `Customer Reviews (${localReviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2 font-playfair cursor-pointer",
                  activeTab === tab.id
                    ? "border-amber-500 text-amber-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-62.5">
            {activeTab === "description" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-3xl">
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {product.description || "Handcrafted with perfection, this piece from Radhika Jewellers encapsulates timeless heritage and modern sophistication. Engineered using hypoallergenic skin-safe alloys and coated with high-grade multi-layer gold polish."}
                </p>
                {product.shortDescription && (
                  <p className="text-sm text-foreground font-medium italic border-l-2 border-amber-500 pl-4 py-1">
                    &quot;{product.shortDescription}&quot;
                  </p>
                )}
              </motion.div>
            )}

            {activeTab === "specs" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Material</th>
                      <td className="py-3 font-medium text-foreground">{product.material || "Brass Alloy with Premium Gold Plating"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider">Stone / Gemstone</th>
                      <td className="py-3 font-medium text-foreground">{product.stone || "High-Grade Kundan & CZ Diamond"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider">Color</th>
                      <td className="py-3 font-medium text-foreground">{product.color || "Gold"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider">Weight</th>
                      <td className="py-3 font-medium text-foreground">{product.weight || "38 grams"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider">Dimensions</th>
                      <td className="py-3 font-medium text-foreground">{product.dimensions || "Standard Adjustable Fit"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider">Occasion</th>
                      <td className="py-3 font-medium text-foreground">{product.occasion || "Bridal & Festive Wear"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider">Gender</th>
                      <td className="py-3 font-medium text-foreground">{product.gender || "Women"}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <th className="py-3 font-semibold text-muted-foreground uppercase tracking-wider">Country of Origin</th>
                      <td className="py-3 font-medium text-foreground">India</td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === "care" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-3xl">
                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <h4 className="font-playfair font-bold text-amber-500 text-sm">Handling & Maintenance</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {product.careInstructions || "Avoid direct contact with perfumes, hairspray, and sanitizers. Wipe clean with a soft dry microfiber cloth after use, and store in our moisture-resistant velvet box."}
                  </p>
                </div>
                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <h4 className="font-playfair font-bold text-amber-500 text-sm">Warranty Terms</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {product.warranty || "Back by Radhika Jewellers 6-Month Plating & Setting Guarantee."}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "shipping" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-3xl">
                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <h4 className="font-playfair font-bold text-amber-500 text-sm">Shipping Policy</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {product.shippingInfo || "Orders are processed and dispatched within 24-48 hours. Free insured delivery pan-India via BlueDart and Shiprocket."}
                  </p>
                </div>
                <div className="border-l-2 border-amber-500 pl-4 py-1">
                  <h4 className="font-playfair font-bold text-amber-500 text-sm">Return & Exchange Policy</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {product.returnPolicy || "Easy 48-hour return and replacement window for unboxing damages or defect claims."}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-3xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-secondary/30 border border-border/40 rounded-3xl">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold font-playfair text-amber-500">{product.averageRating || 4.8}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Out of 5</p>
                    </div>
                    <div>
                      <div className="flex text-amber-500 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Based on {localReviews.length} customer ratings</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-6 py-2.5 bg-amber-500 text-black text-xs font-bold rounded-full hover:bg-amber-400 transition-all shadow-md cursor-pointer"
                  >
                    Write a Review
                  </button>
                </div>

                <div className="space-y-4">
                  {localReviews.map((rev) => (
                    <div key={rev.id} className="p-4 border-b border-border/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-foreground">{rev.author}</span>
                          {rev.verified && (
                            <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                      </div>

                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3.5 h-3.5", i < rev.rating ? "fill-current" : "text-muted/30")} />
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Dynamic Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border/40">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500 font-playfair block mb-1">
                  You May Also Like
                </span>
                <h2 className="text-2xl font-playfair font-bold text-foreground">
                  Customers Also Viewed
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-semibold text-amber-500 hover:underline">
                View All Catalogue →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel: any) => (
                <Link
                  key={rel._id}
                  href={`/product/${rel.slug || rel._id}`}
                  className="group bg-card border border-border/40 rounded-3xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col"
                >
                  <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                    <Image
                      src={rel.images?.[0] || fallbackImage}
                      alt={rel.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors truncate">
                        {rel.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{rel.category?.name || 'Jewellery'}</p>
                    </div>
                    <p className="text-sm font-bold text-amber-500 mt-3">
                      ₹{(rel.finalPrice || rel.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Social Share Modal (WhatsApp, Facebook, X, Pinterest, Copy Link) */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 max-w-sm w-full bg-card border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-playfair font-bold text-foreground mb-1">Share Luxury Jewellery</h3>
              <p className="text-xs text-muted-foreground mb-6">Spread the royal elegance with friends & family</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center space-x-2.5 p-3 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={shareFacebook}
                  className="flex items-center space-x-2.5 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={shareTwitter}
                  className="flex items-center space-x-2.5 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-500 hover:bg-sky-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  onClick={sharePinterest}
                  className="flex items-center space-x-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Pinterest</span>
                </button>
              </div>

              <div className="pt-4 border-t border-border/40">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-secondary border border-border/60 hover:border-amber-500 rounded-xl text-xs font-bold text-foreground hover:text-amber-500 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Product Link</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 text-white p-3 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-4xl aspect-4/5 md:aspect-square">
              <Image
                src={images[activeImage] || fallbackImage}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write a Review Modal Form */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 max-w-lg w-full bg-card border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-playfair font-bold text-foreground mb-1">Write a Customer Review</h3>
              <p className="text-xs text-muted-foreground mb-6">Share your feedback on {product.name}</p>

              {reviewSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500 text-green-500 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Thank you for your review!</p>
                  <p className="text-xs text-muted-foreground">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleWriteReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Your Rating</label>
                    <div className="flex space-x-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="p-1 focus:outline-none cursor-pointer"
                        >
                          <Star className={cn("w-6 h-6", star <= reviewRating ? "fill-current text-amber-500" : "text-muted/30")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Review Comments</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share details about quality, shine, finish, and delivery experience..."
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl p-4 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-all shadow-md cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
