"use client";

import { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Package, 
  CreditCard, 
  Tag, 
  Undo2, 
  ArrowUpRight, 
  BarChart3, 
  Sparkles, 
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from '@/shared/lib/utils';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load analytics data.');
      }
    } catch (err) {
      setError('A network error occurred while loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-120 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Aggregating store telemetry & sales analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Store Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep-dive customer behavior reports, search patterns, and sales trends.</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="text-sm font-semibold">{error || 'Failed to load store analytics'}</span>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const { summary, statusMap, chartTrend, topProducts } = data;

  const totalPaymentOrders = (summary.codOrdersCount || 0) + (summary.razorpayOrdersCount || 0);
  const onlinePaymentPercent = totalPaymentOrders > 0 ? Math.round((summary.razorpayOrdersCount / totalPaymentOrders) * 100) : 0;
  const codPaymentPercent = totalPaymentOrders > 0 ? 100 - onlinePaymentPercent : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground flex items-center">
            Store Analytics <Sparkles className="w-5 h-5 ml-2.5 text-amber-500" />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time revenue metrics, order velocity, payment breakdown, and product performance.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="self-start sm:self-auto bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/50 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Key Performance Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-playfair font-black text-foreground">
              ₹{summary.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center mt-1 text-xs text-emerald-500 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Lifetime confirmed revenue</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-playfair font-black text-foreground">
              {summary.totalOrdersCount.toLocaleString()}
            </h3>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground mr-1">₹{summary.averageOrderValue.toLocaleString('en-IN')}</span> Average Order Value
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Customers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-playfair font-black text-foreground">
              {summary.totalCustomers.toLocaleString()}
            </h3>
            <div className="flex items-center mt-1 text-xs text-purple-500 font-semibold">
              <span>{summary.totalProducts} Products listed</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discounts Provided</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-playfair font-black text-foreground">
              ₹{summary.totalDiscountGiven.toLocaleString('en-IN')}
            </h3>
            <div className="flex items-center mt-1 text-xs text-emerald-500 font-semibold">
              <span>Promotional & coupon savings</span>
            </div>
          </div>
        </div>

      </div>

      {/* Revenue Trend Visualizer */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-border/40">
          <div>
            <h2 className="text-xl font-playfair font-bold text-foreground flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-amber-500" /> Revenue & Order Volume Breakdown
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Aggregated monthly sales performance trends</p>
          </div>
        </div>

        <div className="space-y-4">
          {chartTrend.map((item: any, idx: number) => {
            const maxRevenue = Math.max(...chartTrend.map((t: any) => t.revenue || 1));
            const percentage = Math.min(100, Math.max(8, Math.round((item.revenue / maxRevenue) * 100)));

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground w-28 shrink-0">{item.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">{item.orders} Orders</span>
                    <span className="font-bold text-amber-500 font-mono text-xs w-28 text-right">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-secondary/40 h-3 rounded-full overflow-hidden p-0.5 border border-border/30">
                  <div 
                    className="bg-linear-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Section: Payment Method Breakdown & Order Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods Distribution */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-playfair font-bold text-foreground mb-1 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-amber-500" /> Payment Gateway vs COD Ratio
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Distribution between online Razorpay payments and Cash on Delivery</p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-foreground flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span> Razorpay Online Payments
                  </span>
                  <span className="font-mono font-bold text-amber-500">{summary.razorpayOrdersCount || 0} Orders ({onlinePaymentPercent}%)</span>
                </div>
                <div className="w-full bg-secondary/40 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${onlinePaymentPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-foreground flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Cash On Delivery (COD)
                  </span>
                  <span className="font-mono font-bold text-blue-500">{summary.codOrdersCount || 0} Orders ({codPaymentPercent}%)</span>
                </div>
                <div className="w-full bg-secondary/40 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${codPaymentPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Verified Paid Orders: <strong className="text-emerald-500">{summary.paidOrdersCount || 0}</strong></span>
            <span>Total Refunds Processed: <strong className="text-amber-500">₹{summary.totalRefunded.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Order Fulfillment Statuses */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-playfair font-bold text-foreground mb-1 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-amber-500" /> Order Fulfillment Statuses
          </h2>
          <p className="text-xs text-muted-foreground mb-6">Current breakdown of orders across the fulfillment lifecycle</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Confirmed', count: statusMap['Confirmed'] || 0, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
              { label: 'Order Placed', count: statusMap['Order Placed'] || 0, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
              { label: 'Packed', count: statusMap['Packed'] || 0, color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
              { label: 'Shipped', count: statusMap['Shipped'] || 0, color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
              { label: 'Delivered', count: statusMap['Delivered'] || 0, color: 'bg-green-500/10 text-green-500 border-green-500/30' },
              { label: 'Returned', count: statusMap['Returned'] || 0, color: 'bg-rose-500/10 text-rose-500 border-rose-500/30' },
            ].map((stat, idx) => (
              <div key={idx} className={cn("p-3.5 rounded-2xl border flex flex-col justify-between", stat.color)}>
                <span className="text-[11px] font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="text-2xl font-black font-playfair mt-1">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Best-Selling Products Table */}
      {topProducts && topProducts.length > 0 && (
        <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
            <div>
              <h2 className="text-xl font-playfair font-bold text-foreground flex items-center">
                <Award className="w-5 h-5 mr-2 text-amber-500" /> Best Performing Products
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Top products generated by overall order volume and sales revenue</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {topProducts.map((prod: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground flex items-center">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold flex items-center justify-center mr-3 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-xs">{prod.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">{prod.totalUnitsSold} units</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-500">₹{prod.totalRevenueGenerated.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
