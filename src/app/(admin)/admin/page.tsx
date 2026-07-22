export const dynamic = 'force-dynamic';

import { 
  TrendingUp, 
  Users, 
  Package, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  ListTree,
  AlertTriangle
} from "lucide-react";
import connectDB from "@/shared/lib/mongodb";
import Product from "@/backend/models/Product";
import Category from "@/backend/models/Category";
import User from "@/backend/models/User";
import ActivityLog from "@/backend/models/ActivityLog";
import { DashboardCharts } from "@/frontend/components/admin/DashboardCharts";

export default async function AdminDashboard() {
  await connectDB();
  
  // Fetch real counts
  const totalProducts = await Product.countDocuments();
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
  const totalCategories = await Category.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'user' });
  const recentActivities = await ActivityLog.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');

  // Return & Refund Analytics
  const mongoose = require('mongoose');
  const Return = mongoose.models.Return || require('@/backend/models/Return').default;
  const Order = mongoose.models.Order || require('@/backend/models/Order').default;
  
  const pendingReturns = await Return.countDocuments({ status: { $in: ['Return Requested', 'Under Review', 'Quality Check'] } });
  
  const refundStats = await Return.aggregate([
    { $match: { status: 'Refund Completed' } },
    { $group: { _id: null, totalRefunded: { $sum: '$totalRefundAmount' } } }
  ]);
  const totalRefundedAmount = refundStats[0]?.totalRefunded || 0;

  // Real Lifetime Revenue from Order Model
  const revenueStats = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenueAmount = revenueStats[0]?.totalRevenue || 0;

  // Real Monthly Revenue Chart Data
  const monthlyRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = monthlyRevenue.map((item: any) => ({
    name: monthNames[item._id.month - 1] || "Month",
    revenue: item.revenue,
    orders: item.orders
  }));

  const finalChartData = chartData.length > 0 ? chartData : [
    { name: "Jan", revenue: 0, orders: 0 },
    { name: "Feb", revenue: 0, orders: 0 },
    { name: "Mar", revenue: 0, orders: 0 },
    { name: "Apr", revenue: 0, orders: 0 },
    { name: "May", revenue: 0, orders: 0 },
    { name: "Jun", revenue: 0, orders: 0 },
    { name: "Jul", revenue: 0, orders: 0 },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenueAmount.toLocaleString('en-IN')}`,
      change: "Lifetime sales",
      isPositive: true,
      icon: IndianRupee,
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: "Active in store",
      isPositive: true,
      icon: Package,
    },
    {
      title: "Total Categories",
      value: totalCategories.toString(),
      change: "Active categories",
      isPositive: true,
      icon: ListTree,
    },
    {
      title: "Active Customers",
      value: totalCustomers.toString(),
      change: "Registered users",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Pending Returns",
      value: pendingReturns.toString(),
      change: "Action required",
      isPositive: false,
      icon: AlertTriangle,
    },
    {
      title: "Refunds Processed",
      value: `₹${totalRefundedAmount.toLocaleString('en-IN')}`,
      change: "Total refunded",
      isPositive: true,
      icon: ArrowDownRight,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className="p-2 bg-secondary/50 rounded-lg">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="flex items-center mt-1 text-xs font-medium text-muted-foreground">
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col h-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-playfair font-bold text-lg">Revenue Overview</h3>
            <select className="bg-secondary/30 border-none text-xs rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex-1 w-full relative">
            <DashboardCharts data={finalChartData} />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-playfair font-bold text-lg">Recent Activities</h3>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity._id.toString()} className="flex items-start justify-between p-3 hover:bg-secondary/30 rounded-xl transition-colors">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.entityType} • {(activity.user as any)?.name || 'System'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Low Stock Alerts */}
      {lowStockProducts > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start space-x-4">
          <div className="p-3 bg-red-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-600">Inventory Alert</h3>
            <p className="text-sm text-red-600/80 mt-1">You have {lowStockProducts} products with low stock (less than 10 items remaining). Please restock soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
