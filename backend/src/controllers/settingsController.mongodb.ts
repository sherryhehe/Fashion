import { Request, Response } from 'express';
import Setting from '../models/Setting';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';
import {
  getShippingSettingsResolved,
  SHIPPING_COST_KEY,
  SHIPPING_TIME_KEY,
} from '../utils/shippingSettings';

const PAYMENT_CURRENCY_KEY = 'payment_currency';

/**
 * GET /api/settings/payment - Get payment-related settings (admin or public read for currency)
 */
export const getPaymentSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
    let currency = process.env.STRIPE_CURRENCY || 'pkr';
    const doc = await Setting.findOne({ key: PAYMENT_CURRENCY_KEY }).lean();
    if (doc && doc.value) currency = doc.value;
    successResponse(res, {
      stripeConfigured,
      currency,
      message: stripeConfigured
        ? 'Stripe is configured. Payments will go to your connected Stripe account.'
        : 'Set STRIPE_SECRET_KEY in .env to enable card payments.',
    });
  } catch (error) {
    console.error('Get payment settings error:', error);
    errorResponse(res, 'Failed to get payment settings', 500);
  }
};

/**
 * PATCH /api/settings/payment - Update payment settings (admin only)
 * Body: { currency?: string }
 */
export const updatePaymentSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currency } = req.body || {};
    if (currency !== undefined) {
      await Setting.findOneAndUpdate(
        { key: PAYMENT_CURRENCY_KEY },
        { $set: { value: String(currency).trim() || 'pkr' } },
        { upsert: true, new: true }
      );
    }
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
    const doc = await Setting.findOne({ key: PAYMENT_CURRENCY_KEY }).lean();
    const finalCurrency = (doc && doc.value) || process.env.STRIPE_CURRENCY || 'pkr';
    successResponse(res, { stripeConfigured, currency: finalCurrency }, 'Payment settings updated');
  } catch (error) {
    console.error('Update payment settings error:', error);
    errorResponse(res, 'Failed to update payment settings', 500);
  }
};

/**
 * GET /api/settings/shipping — Public (mobile + admin) read for delivery fee and ETA copy.
 */
export const getShippingSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getShippingSettingsResolved();
    successResponse(res, settings);
  } catch (error) {
    console.error('Get shipping settings error:', error);
    errorResponse(res, 'Failed to get shipping settings', 500);
  }
};

/**
 * PATCH /api/settings/shipping — Admin only
 * Body: { shippingCost?: number, estimatedDelivery?: string }
 */
export const updateShippingSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shippingCost, estimatedDelivery } = req.body || {};

    if (shippingCost !== undefined) {
      const n = typeof shippingCost === 'number' ? shippingCost : Number(shippingCost);
      if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) {
        errorResponse(res, 'shippingCost must be a number between 0 and 1e9', 400);
        return;
      }
      await Setting.findOneAndUpdate(
        { key: SHIPPING_COST_KEY },
        { $set: { value: Math.round(n) } },
        { upsert: true, new: true }
      );
    }

    if (estimatedDelivery !== undefined) {
      const text = String(estimatedDelivery).trim().slice(0, 200);
      await Setting.findOneAndUpdate(
        { key: SHIPPING_TIME_KEY },
        { $set: { value: text } },
        { upsert: true, new: true }
      );
    }

    const settings = await getShippingSettingsResolved();
    successResponse(res, settings, 'Shipping settings updated');
  } catch (error) {
    console.error('Update shipping settings error:', error);
    errorResponse(res, 'Failed to update shipping settings', 500);
  }
};
