/**
 * Brand Service
 * Handles all brand-related API calls
 */

import apiClient from './api.service';
import { getUserCountry } from '../utils/userCountry';

export interface Brand {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  status: string;
  featured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandResponse {
  success: boolean;
  data: Brand[];
  message?: string;
}

export interface SingleBrandResponse {
  success: boolean;
  data: Brand;
  message?: string;
}

const brandService = {
  /**
   * Get all brands (public endpoint - accessible to guests)
   */
  getAll: async (): Promise<BrandResponse> => {
    const country = await getUserCountry();
    return apiClient.get(country ? `/brands?country=${encodeURIComponent(country)}` : '/brands');
  },

  /**
   * Get brand by ID (public endpoint - accessible to guests)
   */
  getById: async (id: string): Promise<SingleBrandResponse> => {
    return apiClient.get(`/brands/${id}`);
  },

  /**
   * Get featured brands (public endpoint)
   */
  getFeatured: async (): Promise<BrandResponse> => {
    const country = await getUserCountry();
    return apiClient.get(country ? `/brands/featured?country=${encodeURIComponent(country)}` : '/brands/featured');
  },

  /**
   * Get top brands (public endpoint)
   */
  getTopBrands: async (): Promise<BrandResponse> => {
    const country = await getUserCountry();
    return apiClient.get(country ? `/brands/top?country=${encodeURIComponent(country)}` : '/brands/top');
  },

  /**
   * Get brand by exact name (for product detail screen - returns single brand to fix wrong brand opening)
   */
  getByName: async (name: string): Promise<SingleBrandResponse> => {
    if (!name || !name.trim()) {
      return { success: false, data: null as any };
    }
    const res = await apiClient.get(`/brands/by-name/${encodeURIComponent(name.trim())}`);
    return { success: true, data: res.data };
  },

  /**
   * Get allowed payment methods for given brand names (intersection). For checkout.
   */
  getAllowedPaymentMethods: async (brandNames: string[]): Promise<{ allowedPaymentMethods: string[] }> => {
    const names = [...new Set(brandNames.map((n) => (n || '').trim()).filter(Boolean))];
    if (names.length === 0) {
      return { allowedPaymentMethods: ['stripe', 'cash'] };
    }
    const res: any = await apiClient.get(
      `/brands/allowed-payment-methods?names=${names.map((n) => encodeURIComponent(n)).join(',')}`
    );
    const raw = res?.data?.allowedPaymentMethods ?? res?.allowedPaymentMethods;
    const normalized: string[] = Array.isArray(raw)
      ? raw.reduce<string[]>((acc, method) => {
          const normalizedMethod = String(method).toLowerCase();
          if (normalizedMethod === 'card' || normalizedMethod === 'stripe') acc.push('stripe');
          if (normalizedMethod === 'cash') acc.push('cash');
          return acc;
        }, [])
      : ['stripe', 'cash'];

    return {
      allowedPaymentMethods: normalized.length > 0 ? Array.from(new Set(normalized)) : ['cash'],
    };
  },

  /**
   * Get per-brand accepted payment methods for checkout.
   * Returns each brand's accepted method ids ('card' or a custom method _id)
   * plus a lookup map of method details. The checkout screen intersects the
   * per-brand lists and, when there is no overlap, asks the customer to order
   * the brands separately.
   */
  getCheckoutPaymentMethods: async (
    brandNames: string[]
  ): Promise<{
    brands: Array<{ name: string; accepts: string[] }>;
    methods: Record<string, { id: string; name: string; instructions?: string; kind: 'card' | 'custom' }>;
  }> => {
    const names = [...new Set(brandNames.map((n) => (n || '').trim()).filter(Boolean))];
    const query = names.length
      ? `?names=${names.map((n) => encodeURIComponent(n)).join(',')}`
      : '';
    const res: any = await apiClient.get(`/brands/checkout-payment-methods${query}`);
    const data = res?.data ?? res ?? {};
    return {
      brands: Array.isArray(data.brands) ? data.brands : [],
      methods: data.methods && typeof data.methods === 'object' ? data.methods : {},
    };
  },
};

export default brandService;
