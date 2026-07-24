"use client";

import { useState } from "react";
import { XCircle, ChevronRight, ChevronLeft, Loader2, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CancelOrderModalProps {
  order: any;
  onClose: () => void;
  onSuccess: (updatedOrder: any) => void;
}

const STEP1_REASONS = [
  { id: "Ordered by mistake", label: "Ordered by mistake / Changed my mind", icon: "🛍️" },
  { id: "Found a better price elsewhere", label: "Found a lower price elsewhere", icon: "💰" },
  { id: "Shipping time is too long", label: "Delivery time is too long / Delayed", icon: "⏱️" },
  { id: "Need to change shipping address or item", label: "Need to change shipping address or item", icon: "📍" },
  { id: "Other", label: "Financial reasons / Other", icon: "💸" },
];

const STEP2_FACTORS = [
  "I plan to reorder a different jewelry piece later",
  "I purchased from another store",
  "I no longer need this item",
  "Shipping or payment issues",
];

export default function CancelOrderModal({ order, onClose, onSuccess }: CancelOrderModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [primaryReason, setPrimaryReason] = useState("");
  const [secondaryFactor, setSecondaryFactor] = useState("");
  const [customFeedback, setCustomFeedback] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmCancel = async () => {
    if (!primaryReason || !secondaryFactor) {
      setError("Please complete the questionnaire before cancelling.");
      return;
    }

    setIsCancelling(true);
    setError("");

    const fullReasonString = `Primary Reason: ${primaryReason} | Factor: ${secondaryFactor}${
      customFeedback ? ` | Feedback: ${customFeedback}` : ""
    }`;

    try {
      const res = await fetch(`/api/shop/orders/${order.orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: fullReasonString }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to cancel order");
      }

      const updated = { ...order, status: "Cancelled" };
      onSuccess(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 overscroll-contain">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-secondary/30">
          <div className="flex items-center space-x-3 text-red-600">
            <XCircle className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold font-playfair text-foreground">Cancel Order #{order.orderId}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 3 — Cancellation Questionnaire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-secondary h-1.5">
          <div
            className="bg-red-500 h-1.5 transition-all duration-300 ease-out"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Primary Reason */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>1. What is your primary reason for cancelling?</span>
              </div>

              <div className="space-y-2.5">
                {STEP1_REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setPrimaryReason(r.id);
                      setError("");
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left text-sm flex items-center justify-between transition-all ${
                      primaryReason === r.id
                        ? "border-red-500 bg-red-500/10 font-semibold text-red-600 dark:text-red-400 shadow-sm"
                        : "border-border hover:border-red-500/50 text-foreground bg-background"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{r.icon}</span>
                      <span>{r.label}</span>
                    </span>
                    {primaryReason === r.id && <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Secondary Factor */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>2. Which of the following best describes your decision?</span>
              </div>

              <div className="space-y-2.5">
                {STEP2_FACTORS.map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => {
                      setSecondaryFactor(factor);
                      setError("");
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left text-sm flex items-center justify-between transition-all ${
                      secondaryFactor === factor
                        ? "border-red-500 bg-red-500/10 font-semibold text-red-600 dark:text-red-400 shadow-sm"
                        : "border-border hover:border-red-500/50 text-foreground bg-background"
                    }`}
                  >
                    <span>{factor}</span>
                    {secondaryFactor === factor && <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Order Summary & Feedback */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="p-4 bg-secondary/40 border border-border/50 rounded-2xl text-xs space-y-1.5">
                <p className="font-semibold text-foreground text-sm mb-2">Order Cancellation Summary</p>
                <p><span className="text-muted-foreground">Order ID:</span> <strong className="text-foreground">{order.orderId}</strong></p>
                <p><span className="text-muted-foreground">Total Amount:</span> <strong className="text-primary font-bold">₹{order.totalAmount}</strong></p>
                <p><span className="text-muted-foreground">Reason Selected:</span> {primaryReason}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Additional Feedback (Optional)
                </label>
                <textarea
                  placeholder="Is there anything we could have done better?"
                  rows={3}
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-red-500 outline-none text-sm resize-none"
                />
              </div>

              <p className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-xl border border-amber-500/20">
                ⚠️ Stock for this order will be restored automatically and your cancellation request will be processed immediately.
              </p>
            </motion.div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-border/50 bg-secondary/20 flex gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              disabled={isCancelling}
              className="py-3 px-5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={isCancelling}
              className="py-3 px-5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Keep Order
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !primaryReason) {
                  setError("Please select a reason to continue.");
                  return;
                }
                if (step === 2 && !secondaryFactor) {
                  setError("Please select an option to continue.");
                  return;
                }
                setError("");
                setStep((step + 1) as any);
              }}
              className="flex-1 py-3 px-6 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="flex-1 py-3 px-6 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancellation"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
