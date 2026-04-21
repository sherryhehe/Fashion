import { Request, Response } from 'express';
import { User, Product, Order, Category } from '../models';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

const LOW_STOCK_THRESHOLD = 20;

type RawVariation = {
  size?: string;
  color?: string;
  stock?: number;
};

const toSafeStock = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, value);
};

const getVariationLabel = (variation: RawVariation): string => {
  const size = typeof variation.size === 'string' ? variation.size.trim() : '';
  const color = typeof variation.color === 'string' ? variation.color.trim() : '';
  if (size && color) return `Size ${size} / ${color}`;
  if (size) return `Size ${size}`;
  if (color) return `Color ${color}`;
  return 'Variation';
};

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

    // Get paid orders count for AOV calculation
    const paidOrdersCount = await Order.countDocuments({ paymentStatus: 'paid' });
    
    // Calculate Average Order Value (AOV)
    const averageOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Low stock alerts: include both product-level and size/color variation-level stock
    const productsForStock = await Product.find({})
      .select('name stock sku variations')
      .lean();

    const lowStockProducts = productsForStock
      .flatMap((product: any) => {
        const alerts: Array<{
          _id: string;
          productId: string;
          name: string;
          sku: string;
          stock: number;
          variantLabel?: string;
        }> = [];

        const productId = String(product._id);
        const productName = product.name || 'Product';
        const sku = product.sku || '-';
        const productStock = Math.max(0, Number(product.stock) || 0);

        if (productStock < LOW_STOCK_THRESHOLD) {
          alerts.push({
            _id: `${productId}-base`,
            productId,
            name: productName,
            sku,
            stock: productStock,
            variantLabel: 'Base Stock',
          });
        }

        const variations: RawVariation[] = Array.isArray(product.variations) ? product.variations : [];
        variations.forEach((variation, index) => {
          const variationStock = toSafeStock(variation?.stock);
          if (variationStock === null || variationStock >= LOW_STOCK_THRESHOLD) return;
          alerts.push({
            _id: `${productId}-var-${index}`,
            productId,
            name: productName,
            sku,
            stock: variationStock,
            variantLabel: getVariationLabel(variation),
          });
        });

        return alerts;
      })
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    // Order stats by status
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

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

