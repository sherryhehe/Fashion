import apiClient from './api.service';

export interface ShippingSettings {
  /** Per-order platform/service fee from API */
  platformFee: number;
  estimatedDelivery: string;
  /** @deprecated Same as platformFee on older payloads */
  shippingCost?: number;
}

/**
 * Public endpoint — no auth required (axios still sends token if present).
 */
export const fetchShippingSettings = async (): Promise<ShippingSettings> => {
  const res: any = await apiClient.get('/settings/shipping');
  const inner = res?.data ?? res;
  const pf = Number(inner?.platformFee);
  const legacy = Number(inner?.shippingCost);
  const platformFee =
    Number.isFinite(pf) && pf >= 0
      ? pf
      : Number.isFinite(legacy) && legacy >= 0
        ? legacy
        : 0;
  return {
    platformFee,
    shippingCost: legacy,
    estimatedDelivery:
      typeof inner?.estimatedDelivery === 'string' ? inner.estimatedDelivery : '',
  };
};
