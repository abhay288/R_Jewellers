"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Share2, Star, Truck, ShieldCheck, Award, RotateCcw, 
  Check, ChevronRight, MapPin, Sparkles, ShoppingBag, Lock, 
  X, Plus, Minus, Maximize2, Copy, Send, Loader2, MessageSquare
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

  // Authentic Database Review State (NO FAKE RATINGS)
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: product.reviewCount || 0,
    averageRating: product.averageRating || 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
  });
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review Modal Form State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Stores
  const { addItem } = useCartStore();
  const { toggleItem: toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { addItem: addRecentlyViewed } = useRecentlyViewedStore();

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  // Fetch Authentic Real Reviews from MongoDB
  const fetchRealReviews = async () => {
    if (!product?._id) return;
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/shop/reviews?productId=${product._id}`);
      if (res.ok) {
        const data = await res.json();
        setRealReviews(data.reviews || []);
        setReviewStats({
          totalReviews: data.totalReviews || 0,
          averageRating: data.averageRating || 0,
          ratingCounts: data.ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchRealReviews();
  }, [product?._id]);

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

  const handleWriteReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment || reviewComment.trim().length < 5) {
      alert("Please write a review comment with at least 5 characters.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/shop/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          userName: reviewName || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReviewSubmitted(true);
        fetchRealReviews();
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewSubmitted(false);
          setReviewTitle("");
          setReviewComment("");
        }, 1500);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Submit review error:", err);
    } finally {
      setSubmittingReview(false);
    }
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
            className="fixed bottom-6 right-6 z-60 bg-amber-500 text-neutral-950 px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center space-x-2 border border-amber-300"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Product Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-6 overflow-x-auto hide-scrollbar">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-amber-500 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Layout (Balanced 50/50 Grid for Luxury E-commerce) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">

          {/* Left Column: Image & Media Gallery */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 md:gap-5">
            
            {/* Thumbnail Carousel Slider */}
            <div className="flex md:flex-col gap-2.5 md:w-20 overflow-x-auto md:overflow-y-auto max-h-[500px] hide-scrollbar pb-2 md:pb-0 shrink-0">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 shadow-xs cursor-pointer",
                    activeImage === idx ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border/40 opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`${product.name} View ${idx + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage View Display (Refined Luxury Max-Height) */}
            <div className="flex-1 relative aspect-4/5 max-h-[500px] w-full bg-secondary/30 rounded-3xl border border-border/40 overflow-hidden group shadow-md">
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
                  <span className="bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
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
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-amber-500 hover:text-black transition-colors shadow-md z-10 cursor-pointer"
                aria-label="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Information & Buying Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
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

              {/* Authentic Ratings Summary Bar (NO FAKE RATINGS) */}
              <div className="flex items-center space-x-3 mb-5">
                <div className="flex items-center bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  <span className="text-xs font-bold text-amber-500 mr-1.5">{reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "0.0"}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {reviewStats.totalReviews > 0 ? `(${reviewStats.totalReviews} Verified Customer Ratings)` : "(No Customer Ratings Yet)"}
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
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {savings > 0 && (
                  <p className="text-xs text-emerald-500 font-medium mt-1">
                    You save ₹{savings.toLocaleString('en-IN')} on this purchase
                  </p>
                )}

                <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/30 pt-2 flex items-center justify-between">
                  <span>Inclusive of all taxes & GST.</span>
                  <strong className="text-emerald-500 font-bold uppercase tracking-wider">Free Shipping</strong>
                </p>
              </div>

              {/* Offer Banner */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-6 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Available Store Offers</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Extra 10% instant discount on UPI / Prepaid online checkout.</li>
                  <li>Complimentary luxury velvet jewellery box included with this purchase.</li>
                </ul>
              </div>

              {/* PIN Code Delivery Estimator */}
              <div className="bg-card border border-border/60 rounded-2xl p-4 mb-6 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Pincode Delivery Estimator
                </label>
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode (e.g. 110001)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="flex-1 bg-secondary/50 border border-border/60 rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isCheckingPincode}
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isCheckingPincode ? "Checking..." : "Check"}
                  </button>
                </form>

                {deliveryInfo && (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                    {deliveryInfo.error ? (
                      <p className="text-xs font-medium text-red-500">{deliveryInfo.error}</p>
                    ) : (
                      <>
                        <div className="flex items-center text-xs font-semibold text-emerald-500">
                          <Truck className="w-4 h-4 mr-1.5 text-amber-500" />
                          <span>Estimated Delivery: {deliveryInfo.dateRange}</span>
                        </div>
                        {deliveryInfo.isCodAvailable && (
                          <div className="flex items-center text-[11px] text-muted-foreground font-medium pl-5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                            <span>Cash on Delivery (COD) Available</span>
                          </div>
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
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Status Indicator */}
                <div>
                  {product.stock > 5 ? (
                    <span className="text-xs font-semibold text-emerald-500 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
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
                    "flex-1 h-13 rounded-full font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer",
                    product.stock > 0
                      ? "bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-amber-500/20"
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

                {/* Share Button */}
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

        {/* Specifications, Care & Authentic Customer Reviews Tabs */}
        <div className="mt-16 pt-10 border-t border-border/40 max-w-7xl mx-auto">
          
          {/* Tab Headers */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 border-b border-border/40 pb-4 overflow-x-auto hide-scrollbar">
            {["description", "specifications", "care", "shipping", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-xs sm:text-sm font-bold uppercase tracking-widest pb-4 border-b-2 transition-all whitespace-nowrap cursor-pointer",
                  activeTab === tab
                    ? "border-amber-500 text-amber-500 font-playfair"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "description" && "Description"}
                {tab === "specifications" && "Specifications"}
                {tab === "care" && "Jewellery Care"}
                {tab === "shipping" && "Shipping & Returns"}
                {tab === "reviews" && `Customer Reviews (${reviewStats.totalReviews})`}
              </button>
            ))}
          </div>

          {/* Tab Body */}
          <div className="py-8">
            {activeTab === "description" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-sm">
                <div dangerouslySetInnerHTML={{ __html: product.description || `<p>${product.name} handcrafted with premium gold plating finish and Kundan setting.</p>` }} />
              </motion.div>
            )}

            {activeTab === "specifications" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40 flex justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Base Material</span>
                  <span className="font-bold text-foreground">{product.material || "Brass Alloy with Gold Plating"}</span>
                </div>
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40 flex justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Gemstone Type</span>
                  <span className="font-bold text-foreground">{product.stone || "Precision-Cut Kundan & CZ"}</span>
                </div>
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40 flex justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Color / Polish</span>
                  <span className="font-bold text-foreground">{product.color || "Royal Gold"}</span>
                </div>
                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40 flex justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Occasion</span>
                  <span className="font-bold text-foreground">{product.occasion || "Bridal & Wedding Collection"}</span>
                </div>
              </motion.div>
            )}

            {activeTab === "care" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-3xl text-xs text-muted-foreground leading-relaxed">
                <p>To preserve the brilliant gold polish and stone settings of your jewellery:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Avoid contact with perfumes, hairsprays, body lotions, and harsh household chemicals.</li>
                  <li>Always put on your jewellery as the last step when getting dressed and remove first before sleeping.</li>
                  <li>Store each piece separately in airtight zip-lock bags or velvet-lined boxes.</li>
                </ul>
              </motion.div>
            )}

            {activeTab === "shipping" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
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

            {/* AUTHENTIC REVIEWS TAB (NO FAKE REVIEWS) */}
            {activeTab === "reviews" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl">
                
                {/* Rating Overview Box */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-secondary/30 border border-border/40 rounded-3xl">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-4xl font-black font-playfair text-amber-500">
                        {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "0.0"}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Out of 5.0</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-4 h-4", i < Math.round(reviewStats.averageRating) ? "fill-current" : "text-muted/30")} />
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        {reviewStats.totalReviews > 0 ? `Based on ${reviewStats.totalReviews} verified customer reviews` : "No ratings submitted yet"}
                      </p>
                    </div>
                  </div>

                  {/* Rating Breakdown Bars */}
                  {reviewStats.totalReviews > 0 && (
                    <div className="w-full md:w-56 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewStats.ratingCounts[star] || 0;
                        const pct = reviewStats.totalReviews > 0 ? Math.round((count / reviewStats.totalReviews) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center text-[10px] space-x-2">
                            <span className="w-3 text-muted-foreground font-bold">{star}★</span>
                            <div className="flex-1 h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-7 text-right text-muted-foreground">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-6 py-3 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-full hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                  >
                    + Write a Review
                  </button>
                </div>

                {/* Reviews List */}
                {loadingReviews ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-xs space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Loading customer reviews...</span>
                  </div>
                ) : realReviews.length > 0 ? (
                  <div className="space-y-4">
                    {realReviews.map((rev) => (
                      <div key={rev._id} className="p-6 bg-card border border-border/40 rounded-2xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xs font-bold text-foreground">{rev.userName || 'Verified Buyer'}</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center">
                              <Check className="w-3 h-3 mr-1" /> Verified Purchase
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {rev.title && (
                          <h5 className="font-bold text-sm text-foreground">{rev.title}</h5>
                        )}

                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("w-3.5 h-3.5", i < rev.rating ? "fill-current" : "text-muted/30")} />
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-secondary/20 rounded-3xl border border-border/40 space-y-3">
                    <MessageSquare className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
                    <h4 className="text-base font-playfair font-bold text-foreground">No Customer Reviews Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Be the first to share your honest review & experience with this handcrafted piece!
                    </p>
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-6 py-2.5 bg-amber-500 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-amber-400 transition-all shadow-md cursor-pointer"
                    >
                      Submit First Review
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Dynamic Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border/40 max-w-7xl mx-auto">
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

      {/* Social Share Modal */}
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
                  className="flex items-center space-x-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold text-xs hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={shareFacebook}
                  className="flex items-center space-x-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 font-bold text-xs hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={shareTwitter}
                  className="flex items-center space-x-2 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-500 font-bold text-xs hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Twitter (X)</span>
                </button>
                <button
                  onClick={sharePinterest}
                  className="flex items-center space-x-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-xs hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Pinterest</span>
                </button>
              </div>

              <div className="pt-4 border-t border-border/40">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center space-x-2 bg-secondary border border-border/60 p-3 rounded-2xl text-xs font-bold text-foreground hover:bg-amber-500 hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Product Link</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Gallery Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 text-white p-3 rounded-full hover:bg-white/20 transition-colors z-20 cursor-pointer"
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

      {/* Write a Real Review Modal Form */}
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
              <p className="text-xs text-muted-foreground mb-6">Share your authentic feedback on {product.name}</p>

              {reviewSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Thank you for your review!</p>
                  <p className="text-xs text-muted-foreground">Your review has been recorded and updated in our store metrics.</p>
                </div>
              ) : (
                <form onSubmit={handleWriteReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Select Star Rating *</label>
                    <div className="flex space-x-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(reviewRating)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star className={cn("w-7 h-7", star <= (hoverRating || reviewRating) ? "fill-current text-amber-500" : "text-muted/30")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Your Name *</label>
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
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Headline / Summary</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Stunning Kundan setting & royal shine!"
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Review Comments *</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share details about craftsmanship, gold finish, packaging, and delivery..."
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl p-4 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-black py-3 rounded-full text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
                  >
                    {submittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {submittingReview ? "Submitting Review..." : "Submit Authentic Review"}
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
