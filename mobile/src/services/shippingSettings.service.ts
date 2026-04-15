import apiClient from './api.service';

export interface ShippingSettings {
  shippingCost: number;
  estimatedDelivery: string;
}

/**
 * Public endpoint — no auth required (axios still sends token if present).
 */
export const fetchShippingSettings = async (): Promise<ShippingSettings> => {
  const res: any = await apiClient.get('/settings/shipping');
  const inner = res?.data ?? res;
  const parsedShippingCost = Number(inner?.shippingCost);
  return {
    shippingCost:
      Number.isFinite(parsedShippingCost) && parsedShippingCost >= 0 ? parsedShippingCost : 0,
    estimatedDelivery:
      typeof inner?.estimatedDelivery === 'string' ? inner.estimatedDelivery : '',
  };
};
