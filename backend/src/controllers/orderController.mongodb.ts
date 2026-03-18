import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Order, Product, Cart, User } from '../models';
import Brand from '../models/Brand';
import Setting from '../models/Setting';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';
import { PLATFORM_FEE_PKR, CARD_FEE_PERCENT } from '../constants/orderFees';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2026-01-28.clover' }) : null;

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

    // Calculate totals, validate payment method and stock
    let subtotal = 0;
    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        const qty = Math.max(1, Number(item.quantity) || 1);
        const availableStock = product.stock ?? 0;
        if (availableStock < qty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${availableStock}, requested: ${qty}.`
          );
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
        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;
        const productImage = Array.isArray((product as any).images) && (product as any).images.length > 0
          ? String((product as any).images[0])
          : undefined;
        return {
          productId: String(product._id),
          productName: product.name,
          quantity: qty,
          price: unitPrice,
          total: itemTotal,
          size: item.size,
          color: item.color,
          productImage,
        };
      })
    );

    const tax = 0;
    const subtotalRounded = Math.round(subtotal);
    const shippingCost = PLATFORM_FEE_PKR;
    const transactionFee = isCardPayment ? Math.round(subtotalRounded * CARD_FEE_PERCENT) : 0;
    const total = subtotalRounded + shippingCost + transactionFee;

    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    const useStripe = isCardPayment && stripe !== null;
    const paymentStatus = useStripe ? 'pending' : 'paid';

    const orderData: any = {
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
        { status: 'pending', date: new Date().toISOString(), description: 'Order placed' },
      ],
    };

    let paymentIntentId: string | undefined;
    if (useStripe && stripe) {
      const paymentCurrencyDoc = await Setting.findOne({ key: 'payment_currency' }).lean();
      const currency = ((paymentCurrencyDoc?.value || process.env.STRIPE_CURRENCY) || 'pkr').toString().toLowerCase();
      const amountInSmallestUnit = currency === 'pkr' ? total * 100 : Math.round(total * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency,
        metadata: { orderNumber, userId: req.user!.id },
        automatic_payment_methods: { enabled: true },
      });
      paymentIntentId = paymentIntent.id;
      orderData.paymentIntentId = paymentIntentId;
    }

    const order = await Order.create(orderData);

    if (!useStripe) {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    await Cart.deleteMany({ userId: req.user!.id });

    if (useStripe && paymentIntentId && stripe) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const orderObj = order.toObject();
      successResponse(res, { order: orderObj, clientSecret: paymentIntent.client_secret ?? undefined }, 'Order created. Complete payment with Stripe.', 201);
    } else {
      successResponse(res, order, 'Order created successfully', 201);
    }
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

/**
 * Mark order as paid and decrement product stock. Used after Stripe payment succeeds.
 */
async function markOrderPaidAndDecrementStock(order: any): Promise<void> {
  if (order.paymentStatus === 'paid') return;
  order.paymentStatus = 'paid';
  order.timeline.push({
    status: 'paid',
    date: new Date().toISOString(),
    description: 'Payment confirmed',
  });
  await order.save();
  const items = order.items || [];
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
  }
}

export const confirmOrderPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      errorResponse(res, 'Order not found', 404);
      return;
    }
    if (order.paymentStatus !== 'pending' || !(order as any).paymentIntentId) {
      errorResponse(res, 'Order is not pending card payment', 400);
      return;
    }
    if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
      errorResponse(res, 'Access denied', 403);
      return;
    }
    if (stripe) {
      const pi = await stripe.paymentIntents.retrieve((order as any).paymentIntentId);
      if (pi.status !== 'succeeded') {
        errorResponse(res, 'Payment not completed yet', 400);
        return;
      }
    }
    await markOrderPaidAndDecrementStock(order);
    successResponse(res, order, 'Payment confirmed');
  } catch (error: any) {
    console.error('Confirm order payment error:', error);
    errorResponse(res, error?.message || 'Failed to confirm payment', 500);
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

/**
 * Stripe webhook handler. Must be mounted with express.raw({ type: 'application/json' }) so req.body is the raw Buffer.
 * In Stripe Dashboard: add endpoint with URL https://your-api-domain.com/api/orders/stripe-webhook
 * Select event: payment_intent.succeeded. Copy the "Signing secret" (whsec_...) to STRIPE_WEBHOOK_SECRET in .env.
 */
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET is not set');
    res.status(500).json({ error: 'Webhook not configured' });
    return;
  }
  if (!stripe) {
    console.error('Stripe webhook: Stripe is not initialized');
    res.status(500).json({ error: 'Stripe not configured' });
    return;
  }
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }
  // req.body is the raw Buffer when using express.raw()
  const rawBody: Buffer = req.body;
  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    res.status(400).json({ error: 'Invalid body' });
    return;
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err?.message);
    res.status(400).json({ error: `Webhook signature verification failed: ${err?.message}` });
    return;
  }
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentIntentId = paymentIntent.id;
    try {
      const order = await Order.findOne({ paymentIntentId });
      if (order && order.paymentStatus !== 'paid') {
        await markOrderPaidAndDecrementStock(order);
        console.log(`Stripe webhook: order ${order.orderNumber} marked as paid (PaymentIntent ${paymentIntentId})`);
      }
    } catch (err) {
      console.error('Stripe webhook: error marking order paid', err);
      res.status(500).json({ error: 'Failed to process payment_intent.succeeded' });
      return;
    }
  }
  res.status(200).json({ received: true });
};

