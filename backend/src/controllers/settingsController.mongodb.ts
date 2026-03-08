import { Response } from 'express';
import Setting from '../models/Setting';
import { successResponse, errorResponse } from '../utils/responseHelper';
import { AuthRequest } from '../middleware/auth';

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
