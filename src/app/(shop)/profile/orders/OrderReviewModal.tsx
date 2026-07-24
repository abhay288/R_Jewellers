"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, Loader2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderReviewModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
}

export default function OrderReviewModal({ isOpen, order, onClose }: OrderReviewModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(
    order?.products?.[0]?.product || order?.products?.[0] || null
  );
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const prodId = selectedProduct?._id || selectedProduct?.productId || selectedProduct?.id;
    if (!prodId) {
      setError("Please select a product to review.");
      return;
    }
    if (!comment || comment.trim().length < 5) {
      setError("Please write a review comment with at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/shop/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: prodId,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit product review");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overscroll-contain">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-secondary/30">
          <div>
            <h3 className="text-xl font-bold font-playfair text-foreground">Rate & Review Product</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Delivered Order #{order.orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto animate-bounce" />
              <h4 className="text-xl font-bold text-foreground">Thank You for Your Feedback!</h4>
              <p className="text-sm text-muted-foreground">Your product review has been submitted successfully.</p>
            </div>
          ) : (
            <form id="review-form" onSubmit={handleSubmitReview} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-200">
                  {error}
                </div>
              )}

              {/* 1. Product Selector if multiple products in order */}
              {order.products && order.products.length > 1 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                    Select Product to Review
                  </label>
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                    {order.products.map((item: any, idx: number) => {
                      const prodObj = item.product || item;
                      const isSelected = (selectedProduct?._id || selectedProduct?.productId) === (prodObj._id || prodObj.productId);
                      const img = item.image || prodObj.images?.[0] || prodObj.image;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedProduct(prodObj)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs shrink-0 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 font-semibold text-primary"
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          }`}
                        >
                          {img ? (
                            <img src={img} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <Package className="w-6 h-6" />
                          )}
                          <span className="max-w-28 truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Info Card */}
              {selectedProduct && (
                <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-2xl border border-border/50">
                  {selectedProduct.images?.[0] || selectedProduct.image ? (
                    <img
                      src={selectedProduct.images?.[0] || selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">{selectedProduct.name}</h4>
                    <p className="text-xs text-muted-foreground">Rate your overall experience with this item</p>
                  </div>
                </div>
              )}

              {/* 2. Star Rating Input */}
              <div className="text-center space-y-2 py-2 bg-primary/5 border border-primary/20 rounded-2xl">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Rating</p>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-500 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-border/60 fill-transparent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {rating === 5 && "⭐ Excellent - Highly Recommended"}
                  {rating === 4 && "⭐ Very Good - Loved It"}
                  {rating === 3 && "⭐ Average - Meets Expectations"}
                  {rating === 2 && "⭐ Poor - Disappointed"}
                  {rating === 1 && "⭐ Terrible - Need Improvement"}
                </p>
              </div>

              {/* 3. Review Title (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Review Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Stunning craftsmanship & brilliant shine!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary outline-none text-sm"
                />
              </div>

              {/* 4. Review Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Detailed Feedback</label>
                <textarea
                  placeholder="Share details about quality, fitting, finish, and packaging..."
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary outline-none text-sm resize-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-border/50 bg-secondary/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4 fill-primary-foreground" />}
              Submit Review
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
