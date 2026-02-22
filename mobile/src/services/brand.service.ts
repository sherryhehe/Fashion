/**
 * Brand Service
 * Handles all brand-related API calls
 */

import apiClient from './api.service';

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
    return apiClient.get('/brands');
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
    return apiClient.get('/brands/featured');
  },

  /**
   * Get top brands (public endpoint)
   */
  getTopBrands: async (): Promise<BrandResponse> => {
    return apiClient.get('/brands/top');
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
      return { allowedPaymentMethods: ['card', 'cash'] };
    }
    const res = await apiClient.get(
      `/brands/allowed-payment-methods?names=${names.map((n) => encodeURIComponent(n)).join(',')}`
    );
    const raw = res?.data?.allowedPaymentMethods ?? res?.allowedPaymentMethods;
    return {
      allowedPaymentMethods: Array.isArray(raw) ? raw : ['card', 'cash'],
    };
  },
};

export default brandService;
