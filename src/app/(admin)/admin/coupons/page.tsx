import { TicketPercent, Plus } from "lucide-react";

export default function CouponsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Discount Coupons</h1>
          <p className="text-muted-foreground mt-1">Create and distribute promotional codes for checkout discounts.</p>
        </div>
        <button className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-primary/20 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-75">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <TicketPercent className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-playfair font-bold text-lg mb-2">No active coupons</h3>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          No promotional codes are currently active. Click 'Create Coupon' to define new discount rates and validity periods.
        </p>
      </div>
    </div>
  );
}
