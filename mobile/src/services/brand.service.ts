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
   * Get all brands (requires authentication)
   */
  getAll: async (): Promise<BrandResponse> => {
    return apiClient.get('/brands');
  },

  /**
   * Get brand by ID (requires authentication)
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
   * Get brand by name (for product detail screen)
   */
  getByName: async (name: string): Promise<BrandResponse> => {
    return apiClient.get(`/brands?name=${encodeURIComponent(name)}`);
  },
};

export default brandService;
