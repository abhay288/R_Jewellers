"use client";

import { useEffect, useState } from "react";
import { TicketPercent, Plus, Loader2, Trash2, Calendar, CheckCircle2, XCircle, Tag, DollarSign, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCouponsClient() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue || !validFrom || !validUntil) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          validFrom,
          validUntil,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setCoupons([data.coupon, ...coupons]);
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: any) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update coupon status");

      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete coupon");

      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinPurchaseAmount("");
    setMaxDiscountAmount("");
    setUsageLimit("");
    setValidFrom(new Date().toISOString().split("T")[0]);
    setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setIsActive(true);
    setFormError("");
  };

  const isExpired = (until: string) => new Date(until) < new Date();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Discount Coupons</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotional discount codes for checkout.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </button>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <TicketPercent className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-playfair font-bold text-xl mb-2">No Active Coupons</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            You haven&apos;t created any discount codes yet. Click &apos;Create Coupon&apos; to get started.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.validUntil);
            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                  !coupon.isActive || expired
                    ? "border-border/50 opacity-75"
                    : "border-primary/30 hover:border-primary"
                }`}
              >
                <div>
                  {/* Badge & Code Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-lg tracking-wider text-foreground">
                        {coupon.code}
                      </span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        expired
                          ? "bg-red-500/10 text-red-600"
                          : coupon.isActive
                          ? "bg-green-500/10 text-green-600"
                          : "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Discount Value */}
                  <div className="mb-4">
                    <span className="text-3xl font-playfair font-bold text-primary">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`}
                    </span>
                    {coupon.maxDiscountAmount && coupon.discountType === "percentage" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Capped up to ₹{coupon.maxDiscountAmount}
                      </p>
                    )}
                  </div>

                  {/* Details List */}
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-6">
                    {coupon.minPurchaseAmount && (
                      <p>Min Purchase: <strong className="text-foreground">₹{coupon.minPurchaseAmount}</strong></p>
                    )}
                    <p>
                      Usage: <strong className="text-foreground">{coupon.usedCount}</strong>{" "}
                      {coupon.usageLimit ? `/ ${coupon.usageLimit} uses` : "uses (Unlimited)"}
                    </p>
                    <div className="flex items-center gap-1 text-muted-foreground pt-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>
                        Valid: {new Date(coupon.validFrom).toLocaleDateString("en-IN")} -{" "}
                        {new Date(coupon.validUntil).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      coupon.isActive
                        ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                        : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className="text-xs text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center space-x-2 text-primary">
                  <TicketPercent className="w-6 h-6" />
                  <h3 className="text-xl font-bold font-playfair text-foreground">Create Discount Coupon</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                {/* Coupon Code */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none font-mono font-bold uppercase tracking-wider text-sm"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={discountType}
                      onChange={(e: any) => setDiscountType(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={discountType === "percentage" ? "10 (% )" : "500 (₹)"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Min Purchase & Max Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Min Purchase Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1000"
                      value={minPurchaseAmount}
                      onChange={(e) => setMinPurchaseAmount(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 2000 (Optional)"
                      disabled={discountType !== "percentage"}
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-sm disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Usage Limit & Dates */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Unlimited"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      required
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="w-full p-2.5 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      required
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full p-2.5 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                    Enable Coupon Immediately
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Coupon"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
