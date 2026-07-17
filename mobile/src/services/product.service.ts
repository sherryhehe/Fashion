/**
 * Product Service
 * Handles all product-related API calls
 */

import apiClient from './api.service';
import { getUserCountry } from '../utils/userCountry';

/** Returns "&country=XX" (or "") for appending to product endpoints. */
const countryParam = async (): Promise<string> => {
  const country = await getUserCountry();
  return country ? `&country=${encodeURIComponent(country)}` : '';
};

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  brand?: string;
  style?: string;
  sku: string;
  stock: number;
  images: string[];
  featured: boolean;
  status: string;
  specifications?: any;
  variations?: any[];
  features?: string[];
  shippingFees?: number;
  shippingTime?: string;
  notes?: string;
  tags?: string[];
  rating: number;
  reviewCount: number;
  reviews?: any[];
  salesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  style?: string;
  status?: string;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

const productService = {
  /**
   * Get all products with filters and pagination
   */
  getAll: async (filters: ProductFilters = {}): Promise<ProductResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    // Gate by the user's selected country (unless a country was passed explicitly)
    if (!('country' in filters)) {
      const country = await getUserCountry();
      if (country) params.append('country', country);
    }

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';

    return apiClient.get(url);
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<SingleProductResponse> => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit: number = 10): Promise<ProductResponse> => {
    const country = await getUserCountry();
    const c = country ? `&country=${encodeURIComponent(country)}` : '';
    return apiClient.get(`/products/featured?limit=${limit}${c}`);
  },

  /**
   * Search products
   */
  search: async (query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    params.append('search', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    if (!('country' in filters)) {
      const country = await getUserCountry();
      if (country) params.append('country', country);
    }

    return apiClient.get(`/products/search?${params.toString()}`);
  },

  /**
   * Get recommended products (using featured for backward compatibility)
   */
  getRecommended: async (limit: number = 10): Promise<ProductResponse> => {
    const c = await countryParam();
    return apiClient.get(`/products/featured?limit=${limit}${c}`);
  },

  /**
   * Get random products (new set each request - for homepage variety)
   */
  getRandom: async (limit: number = 10): Promise<ProductResponse> => {
    const c = await countryParam();
    return apiClient.get(`/products/random?limit=${limit}${c}`);
  },

  /**
   * Get personalized products (cart + wishlist first, then featured). Requires auth.
   */
  getPersonalized: async (limit: number = 10): Promise<ProductResponse> => {
    const c = await countryParam();
    return apiClient.get(`/products/personalized?limit=${limit}${c}`);
  },

  /**
   * Get recently added products (sorted by creation date)
   */
  getRecentlyAdded: async (limit: number = 10): Promise<ProductResponse> => {
    const c = await countryParam();
    return apiClient.get(`/products?limit=${limit}&sortBy=createdAt&order=desc&status=active${c}`);
  },

  /**
   * Get top selling products (using featured products for now)
   * TODO: Implement actual top selling logic based on sales data
   */
  getTopSelling: async (limit: number = 10): Promise<ProductResponse> => {
    const c = await countryParam();
    return apiClient.get(`/products/featured?limit=${limit}${c}`);
  },
};

export default productService;
