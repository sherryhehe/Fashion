import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Order, Product, Cart, User } from '../models';
import Setting from '../models/Setting';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';
import { CARD_FEE_PERCENT } from '../constants/orderFees';
import { getPlatformFeeAmount } from '../utils/shippingSettings';
import {
  decrementStockForSelection,
  getAvailableStockForSelection,
  getSelectionLabel,
} from '../utils/productStock';

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
    // Accept both "card" and "stripe" as Stripe card payments.
    const selectedMethodRaw = (paymentMethod || 'cash').toLowerCase();
    const selectedMethod = selectedMethodRaw === 'stripe' ? 'card' : selectedMethodRaw;
    const isCardPayment = selectedMethod === 'card';

    if (isCardPayment && !stripe) {
      errorResponse(
        res,
        'Card payment is unavailable (Stripe is not configured on the server). Use cash on delivery or contact support.',
        503
      );
      return;
    }

    // Calculate totals, validate payment method and stock
    let subtotal = 0;
    let lineShippingTotal = 0;
    const requestedQuantityBySelection = new Map<string, number>();
    const selectionKey = (productId: string, size?: string, color?: string) =>
      `${productId}|${String(size || '').trim().toLowerCase()}|${String(color || '').trim().toLowerCase()}`;

    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        const qty = Math.max(1, Number(item.quantity) || 1);
        const availableStock = getAvailableStockForSelection(product, item.size, item.color);
        const key = selectionKey(String(product._id), item.size, item.color);
        const previouslyRequested = requestedQuantityBySelection.get(key) ?? 0;
        const totalRequested = previouslyRequested + qty;
        if (availableStock < totalRequested) {
          throw new Error(
            `Insufficient stock for "${product.name}" (${getSelectionLabel(item.size, item.color)}). Available: ${availableStock}, requested: ${totalRequested}.`
          );
        }
        requestedQuantityBySelection.set(key, totalRequested);
        // Use price from request (what customer saw) or fallback to product price
        const unitPrice = typeof item.price === 'number' && item.price >= 0 ? item.price : product.price;
        const itemTotal = unitPrice * qty;
        subtotal += itemTotal;
        const unitShip = Math.max(0, Number((product as any).shippingFees) || 0);
        const lineShip = Math.round(unitShip);
        lineShippingTotal += lineShip;
        const notesSnap =
          typeof (product as any).notes === 'string'
            ? String((product as any).notes).trim().slice(0, 1000)
            : '';
        const shipTimeSnap =
          typeof (product as any).shippingTime === 'string'
            ? String((product as any).shippingTime).trim().slice(0, 120)
            : '';
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
          shippingFee: lineShip,
          notes: notesSnap || undefined,
          shippingTime: shipTimeSnap || undefined,
        };
      })
    );

    const tax = 0;
    const subtotalRounded = Math.round(subtotal);
    const shippingCost = lineShippingTotal;
    const platformFee = await getPlatformFeeAmount();
    const transactionFee = isCardPayment ? Math.round(subtotalRounded * CARD_FEE_PERCENT) : 0;
    const total = subtotalRounded + shippingCost + platformFee + transactionFee;

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
      platformFee,
      transactionFee,
      total,
      status: 'pending',
      paymentMethod: selectedMethod,
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
        const product = await Product.findById(item.productId);
        if (!product) continue;
        await decrementStockForSelection(product, item.quantity, item.size, item.color);
      }
    }

    // For COD clear cart now; for card payments clear only after successful payment.
    if (!useStripe) {
      await Cart.deleteMany({ userId: req.user!.id });
    }

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
    const product = await Product.findById(item.productId);
    if (!product) continue;
    await decrementStockForSelection(product, item.quantity, item.size, item.color);
  }
  // Clear cart only after a successful card payment confirmation.
  await Cart.deleteMany({ userId: order.userId });
}

/**
 * Mark a pending card payment as failed/cancelled.
 */
async function markOrderPaymentFailed(order: any, reason: string): Promise<void> {
  if (order.paymentStatus !== 'pending') return;
  order.paymentStatus = 'failed';
  order.timeline.push({
    status: 'payment_failed',
    date: new Date().toISOString(),
    description: reason,
  });
  await order.save();
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
      if (pi.status === 'canceled' || pi.status === 'requires_payment_method') {
        await markOrderPaymentFailed(order, `Payment ${pi.status.replace(/_/g, ' ')}`);
        errorResponse(res, 'Payment failed or was canceled', 400);
        return;
      }
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
 * Select events: payment_intent.succeeded, payment_intent.payment_failed, payment_intent.canceled.
 * Copy the "Signing secret" (whsec_...) to STRIPE_WEBHOOK_SECRET in .env.
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
  } else if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentIntentId = paymentIntent.id;
    try {
      const order = await Order.findOne({ paymentIntentId });
      if (order) {
        const reason =
          event.type === 'payment_intent.canceled'
            ? 'Payment was canceled'
            : paymentIntent.last_payment_error?.message || 'Payment failed';
        await markOrderPaymentFailed(order, reason);
        console.log(`Stripe webhook: order ${order.orderNumber} marked as failed (PaymentIntent ${paymentIntentId})`);
      }
    } catch (err) {
      console.error('Stripe webhook: error marking order failed', err);
      res.status(500).json({ error: `Failed to process ${event.type}` });
      return;
    }
  }
  res.status(200).json({ received: true });
};

