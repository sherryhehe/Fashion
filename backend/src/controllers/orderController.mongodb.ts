import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, Product, Cart, User } from '../models';
import Brand from '../models/Brand';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';
import { PLATFORM_FEE_PKR, CARD_FEE_PERCENT } from '../constants/orderFees';

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const query: any = {};
    
    // If not admin, only show own orders
    if (req.user!.role !== 'admin') {
      query.userId = req.user!.id;
    } else if (userId) {
      query.userId = userId;
    }
    
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(query);

    // Get unique user IDs from orders and convert to ObjectIds
    const userIds = [...new Set(orders.map(order => order.userId))];
    const userIdsAsObjectIds = userIds
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));
    
    // Fetch user information for all unique user IDs
    let users = [];
    let userMap = new Map();
    
    try {
      if (userIdsAsObjectIds.length > 0) {
        users = await User.find({ _id: { $in: userIdsAsObjectIds } }).select('name email phone');
        
        // Create a map of userId to user info (using string keys for lookup)
        users.forEach(user => {
          const userIdStr = String(user._id);
          userMap.set(userIdStr, {
            name: user.name,
            email: user.email,
            phone: user.phone || null,
          });
        });
        
        // Debug logging
        console.log(`Found ${users.length} users for ${userIds.length} unique user IDs`);
        console.log('User map keys:', Array.from(userMap.keys()));
      }
    } catch (userError) {
      console.error('Error fetching user information:', userError);
      // Continue without user info if there's an error
    }

    // Attach user information to each order
    const ordersWithUserInfo = orders.map(order => {
      const orderObj = order.toObject();
      const userInfo = userMap.get(order.userId) || null;
      return {
        ...orderObj,
        user: userInfo,
      };
    });

    successResponse(res, ordersWithUserInfo, undefined, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    errorResponse(res, 'Failed to get orders', 500);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    // Check permission
    if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    // Fetch user information if userId is valid
    let userInfo = null;
    try {
      if (mongoose.Types.ObjectId.isValid(order.userId)) {
        const user = await User.findById(order.userId).select('name email phone');
        if (user) {
          userInfo = {
            name: user.name,
            email: user.email,
            phone: user.phone || null,
          };
        }
      }
    } catch (userError) {
      console.error('Error fetching user information:', userError);
      // Continue without user info if there's an error
    }

    const orderObj = order.toObject();
    const orderWithUserInfo = {
      ...orderObj,
      user: userInfo,
    };

    successResponse(res, orderWithUserInfo);
  } catch (error) {
    console.error('Get order error:', error);
    errorResponse(res, 'Failed to get order', 500);
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      errorResponse(res, 'Order items are required', 400);
      return;
    }

    if (!shippingAddress) {
      errorResponse(res, 'Shipping address is required', 400);
      return;
    }

    // Resolve payment method (normalize to lowercase for validation)
    const selectedMethod = (paymentMethod || 'cash').toLowerCase();
    const isCardPayment = selectedMethod === 'card';

    // Calculate totals and validate payment method against each product's brand
    let subtotal = 0;
    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        // Validate payment method for this product's brand
        if (product.brand) {
          const brand = await Brand.findOne({ name: new RegExp(`^${String(product.brand).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
          if (brand && Array.isArray((brand as any).allowedPaymentMethods) && (brand as any).allowedPaymentMethods.length > 0) {
            const allowed = (brand as any).allowedPaymentMethods.map((m: string) => String(m).toLowerCase());
            if (!allowed.includes(selectedMethod)) {
              throw new Error(`Brand "${product.brand}" does not accept ${selectedMethod} payment. Allowed: ${allowed.join(', ')}`);
            }
          }
        }
        // Use price from request (what customer saw) or fallback to product price
        const unitPrice = typeof item.price === 'number' && item.price >= 0 ? item.price : product.price;
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;
        // Store first product image so order history shows correct image per item
        const productImage = Array.isArray((product as any).images) && (product as any).images.length > 0
          ? String((product as any).images[0])
          : undefined;
        return {
          productId: String(product._id),
          productName: product.name,
          quantity: item.quantity,
          price: unitPrice,
          total: itemTotal,
          size: item.size,
          color: item.color,
          productImage,
        };
      })
    );

    const tax = 0;
    // Use integer subtotal for consistent fee calculation (match mobile Cart/Checkout)
    const subtotalRounded = Math.round(subtotal);
    const shippingCost = PLATFORM_FEE_PKR; // 200 PKR platform fee (consistent)
    const transactionFee = isCardPayment ? Math.round(subtotalRounded * CARD_FEE_PERCENT) : 0;
    const total = subtotalRounded + shippingCost + transactionFee;

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // Order is placed → treat as paid for revenue (dashboard)
    const paymentStatus = 'paid';

    // Create order
    const order = await Order.create({
      userId: req.user!.id,
      orderNumber,
      items: orderItems,
      subtotal: subtotalRounded,
      tax,
      shippingCost,
      total,
      status: 'pending',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus,
      shippingAddress,
      notes,
      timeline: [
        {
          status: 'pending',
          date: new Date().toISOString(),
          description: 'Order placed',
        },
      ],
    });

    // Clear cart
    await Cart.deleteMany({ userId: req.user!.id });

    successResponse(res, order, 'Order created successfully', 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    errorResponse(res, error.message || 'Failed to create order', 500);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      errorResponse(res, 'Status is required', 400);
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    order.status = status;
    order.timeline.push({
      status,
      date: new Date().toISOString(),
      description: `Order ${status}`,
    });

    await order.save();

    successResponse(res, order, 'Order status updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    errorResponse(res, 'Failed to update order status', 500);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      errorResponse(res, 'Order not found', 404);
      return;
    }

    // Check permission
    if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    if (order.status === 'delivered') {
      errorResponse(res, 'Cannot cancel delivered order', 400);
      return;
    }

    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      date: new Date().toISOString(),
      description: 'Order cancelled',
    });

    await order.save();

    successResponse(res, order, 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);
    errorResponse(res, 'Failed to cancel order', 500);
  }
};

