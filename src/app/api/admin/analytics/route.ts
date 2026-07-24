import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/shared/lib/mongodb';
import Order from '@/backend/models/Order';
import Product from '@/backend/models/Product';
import User from '@/backend/models/User';
import Category from '@/backend/models/Category';
import Return from '@/backend/models/Return';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Match criteria for completed/paid orders only
    const completedOrderMatch: any = {
      $or: [
        { paymentStatus: 'paid' },
        { status: 'Delivered' }
      ]
    };

    // 1. Lifetime Revenue & Orders count
    const totalOrdersCount = await Order.countDocuments();
    const paidOrdersCount = await Order.countDocuments({ paymentStatus: 'paid' });
    const codOrdersCount = await Order.countDocuments({ paymentMethod: 'COD' });
    const razorpayOrdersCount = await Order.countDocuments({ paymentMethod: 'Razorpay' });

    const totalRevenueStats = await Order.aggregate([
      { $match: completedOrderMatch },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalDiscount: { $sum: '$discount' } } }
    ]);

    const totalRevenue = totalRevenueStats[0]?.totalRevenue || 0;
    const totalDiscountGiven = totalRevenueStats[0]?.totalDiscount || 0;
    const completedOrdersCount = await Order.countDocuments(completedOrderMatch);
    const averageOrderValue = completedOrdersCount > 0 ? Math.round(totalRevenue / completedOrdersCount) : 0;

    // 2. Status Breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    // 3. Monthly Revenue Trend (Last 12 months for completed/paid orders)
    const monthlyTrend = await Order.aggregate([
      { $match: completedOrderMatch },
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
    const chartTrend = monthlyTrend.map((item: any) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders
    }));

    // 4. Top Selling Products from Completed/Paid Orders
    const topProducts = await Order.aggregate([
      { $match: completedOrderMatch },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          name: { $first: "$products.name" },
          totalUnitsSold: { $sum: "$products.quantity" },
          totalRevenueGenerated: { $sum: { $multiply: ["$products.finalPrice", "$products.quantity"] } }
        }
      },
      { $sort: { totalUnitsSold: -1 } },
      { $limit: 5 }
    ]);

    // 5. Total Customers & Products
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    // 6. Return & Refund stats
    const totalReturnsCount = await Return.countDocuments();
    const refundStats = await Return.aggregate([
      { $match: { status: 'Refund Completed' } },
      { $group: { _id: null, totalRefunded: { $sum: '$totalRefundAmount' } } }
    ]);
    const totalRefunded = refundStats[0]?.totalRefunded || 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalDiscountGiven,
        totalOrdersCount,
        paidOrdersCount,
        codOrdersCount,
        razorpayOrdersCount,
        averageOrderValue,
        totalCustomers,
        totalProducts,
        totalCategories,
        totalReturnsCount,
        totalRefunded
      },
      statusMap,
      chartTrend: chartTrend.length > 0 ? chartTrend : [
        { month: "Current Month", revenue: totalRevenue, orders: totalOrdersCount }
      ],
      topProducts
    });

  } catch (error: any) {
    console.error('Analytics GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
