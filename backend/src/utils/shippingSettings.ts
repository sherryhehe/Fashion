import Setting from '../models/Setting';
import { PLATFORM_FEE_PKR } from '../constants/orderFees';

export const SHIPPING_COST_KEY = 'shipping_cost';
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

/** Resolved shipping fee used for order totals (defaults to platform fee constant). */
export async function getShippingCostAmount(): Promise<number> {
  const doc = await Setting.findOne({ key: SHIPPING_COST_KEY }).lean();
  const parsed = parseCost(doc?.value);
  return parsed !== null ? parsed : PLATFORM_FEE_PKR;
}

export async function getShippingSettingsResolved(): Promise<{
  shippingCost: number;
  estimatedDelivery: string;
}> {
  const [costDoc, timeDoc] = await Promise.all([
    Setting.findOne({ key: SHIPPING_COST_KEY }).lean(),
    Setting.findOne({ key: SHIPPING_TIME_KEY }).lean(),
  ]);
  const shippingCost = parseCost(costDoc?.value) ?? PLATFORM_FEE_PKR;
  const rawTime = timeDoc?.value;
  const estimatedDelivery =
    typeof rawTime === 'string' && rawTime.trim().length > 0
      ? rawTime.trim().slice(0, 200)
      : DEFAULT_ESTIMATED_DELIVERY;
  return { shippingCost, estimatedDelivery };
}
