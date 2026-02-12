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

    // Get revenue (sum of all paid orders)
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Get paid orders count for AOV calculation
    const paidOrdersCount = await Order.countDocuments({ paymentStatus: 'paid' });
    
    // Calculate Average Order Value (AOV)
    const averageOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

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
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const stats = {
      overview: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        totalCustomers: totalUsers,
        totalProducts: totalProducts,
        averageOrderValue: averageOrderValue,
        paidOrders: paidOrdersCount,
      },
      orders: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
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

