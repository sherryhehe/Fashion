/**
 * Product Service
 * Handles all product-related API calls
 */

import apiClient from './api.service';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  brand?: string;
  sku: string;
  stock: number;
  images: string[];
  featured: boolean;
  status: string;
  specifications?: any;
  variations?: any[];
  rating: number;
  reviewCount: number;
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
    return apiClient.get(`/products/featured?limit=${limit}`);
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

    return apiClient.get(`/products/search?${params.toString()}`);
  },

  /**
   * Get recommended products (using featured products for now)
   * TODO: Implement actual recommendation algorithm
   */
  getRecommended: async (limit: number = 10): Promise<ProductResponse> => {
    return apiClient.get(`/products/featured?limit=${limit}`);
  },

  /**
   * Get personalized products (cart + wishlist first, then featured). Requires auth.
   */
  getPersonalized: async (limit: number = 10): Promise<ProductResponse> => {
    return apiClient.get(`/products/personalized?limit=${limit}`);
  },

  /**
   * Get recently added products (sorted by creation date)
   */
  getRecentlyAdded: async (limit: number = 10): Promise<ProductResponse> => {
    return apiClient.get(`/products?limit=${limit}&sortBy=createdAt&order=desc&status=active`);
  },

  /**
   * Get top selling products (using featured products for now)
   * TODO: Implement actual top selling logic based on sales data
   */
  getTopSelling: async (limit: number = 10): Promise<ProductResponse> => {
    // For now, we'll use featured products as top selling
    // In the future, this could be based on actual sales data
    return apiClient.get(`/products/featured?limit=${limit}`);
  },
};

export default productService;
