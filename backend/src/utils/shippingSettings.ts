import Setting from '../models/Setting';
import { PLATFORM_FEE_PKR } from '../constants/orderFees';

export const SHIPPING_COST_KEY = 'shipping_cost';
/** Platform / service fee per order (not per-product shipping). */
export const PLATFORM_FEE_KEY = 'platform_fee';
export const SHIPPING_TIME_KEY = 'shipping_time_label';

const DEFAULT_ESTIMATED_DELIVERY = '3–5 business days';

function parseCost(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return Math.round(raw);
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return Math.round(n);
  }
  return null;
}

/**
 * Order-level platform fee (admin setting or legacy `shipping_cost` global, then default).
 */
export async function getPlatformFeeAmount(): Promise<number> {
  const platformDoc = await Setting.findOne({ key: PLATFORM_FEE_KEY }).lean();
  let parsed = parseCost(platformDoc?.value);
  if (parsed !== null) return parsed;
  const legacyDoc = await Setting.findOne({ key: SHIPPING_COST_KEY }).lean();
  parsed = parseCost(legacyDoc?.value);
  if (parsed !== null) return parsed;
  return PLATFORM_FEE_PKR;
}

/** @deprecated Use per-product shippingFees + getPlatformFeeAmount — kept for migrations. */
export async function getShippingCostAmount(): Promise<number> {
  return getPlatformFeeAmount();
}

export async function getShippingSettingsResolved(): Promise<{
  /** Per-order platform/service fee (PKR). */
  platformFee: number;
  estimatedDelivery: string;
  /** @deprecated Misnamed in earlier app versions; mirrors platformFee for backward compatibility. */
  shippingCost: number;
}> {
  const platformFee = await getPlatformFeeAmount();
  const timeDoc = await Setting.findOne({ key: SHIPPING_TIME_KEY }).lean();
  const rawTime = timeDoc?.value;
  const estimatedDelivery =
    typeof rawTime === 'string' && rawTime.trim().length > 0
      ? rawTime.trim().slice(0, 200)
      : DEFAULT_ESTIMATED_DELIVERY;
  return {
    platformFee,
    estimatedDelivery,
    shippingCost: platformFee,
  };
}
