import { Request, Response } from 'express';
import { User, Product, Order, Category } from '../models';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Revenue: sum of all paid orders (orders get paymentStatus 'paid' when placed)
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    const totalRevenue = revenueData[0]?.total ?? 0;
    const paidOrderCount = revenueData[0]?.count ?? 0;
    const aov = paidOrderCount > 0 ? Math.round(totalRevenue / paidOrderCount) : 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const [todayData, weeklyData] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' }, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' }, createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ])
    ]);
    const todaySales = todayData[0]?.total ?? 0;
    const weeklySales = weeklyData[0]?.total ?? 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get top products by stock
    const lowStockProducts = await Product.find({ stock: { $lt: 20 } })
      .sort({ stock: 1 })
      .limit(5)
      .select('name stock sku')
      .lean();

    // Order stats by status
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    const stats = {
      overview: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders.toString(),
        totalCustomers: totalUsers.toString(),
        totalProducts: totalProducts.toString(),
        aov,
        paidOrderCount,
        todaySales,
        weeklySales,
      },
      orders: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        total: totalOrders,
      },
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.shippingAddress?.name || 'Guest',
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })),
      lowStockProducts,
      categories: totalCategories,
    };

    successResponse(res, stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    errorResponse(res, 'Failed to get dashboard statistics', 500);
  }
};

/**
 * Get sales chart data
 */
export const getSalesChartData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '1M' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get orders grouped by date
    const salesData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    successResponse(res, {
      period,
      data: salesData,
      total: salesData.reduce((acc, item) => acc + item.revenue, 0),
      orderCount: salesData.reduce((acc, item) => acc + item.count, 0),
    });
  } catch (error) {
    console.error('Get sales chart error:', error);
    errorResponse(res, 'Failed to get sales data', 500);
  }
};

/**
 * Get finance dashboard data (revenue, profit, etc.)
 */
export const getFinanceData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [allRevenue, monthlyRevenueData, lastMonthData] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' }, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' }, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const totalRevenue = allRevenue[0]?.total ?? 0;
    const monthlyRevenue = monthlyRevenueData[0]?.total ?? 0;
    const lastMonthRevenue = lastMonthData[0]?.total ?? 0;
    const growthRate = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : (monthlyRevenue > 0 ? 100 : 0);

    successResponse(res, {
      totalRevenue,
      monthlyRevenue,
      profit: totalRevenue,
      expenses: 0,
      profitMargin: 100,
      growthRate,
    });
  } catch (error) {
    console.error('Get finance data error:', error);
    errorResponse(res, 'Failed to get finance data', 500);
  }
};

