import apiClient from './client';
import { Product, PaginatedResponse, ApiResponse } from '@/types';

/**
 * Products API endpoints
 */
export const productsApi = {
  /**
   * Get all products with optional filters
   */
  getAll: (params?: Record<string, any>) => 
    apiClient.get<PaginatedResponse<Product>>('/products', params),

  /**
   * Get product by ID
   */
  getById: (id: string) => 
    apiClient.get<Product>(`/products/${id}`),

  /**
   * Create new product
   */
  create: (data: Partial<Product>) => 
    apiClient.post<Product>('/products', data),

  /**
   * Update product
   */
  update: (id: string, data: Partial<Product>) => 
    apiClient.put<Product>(`/products/${id}`, data),

  /**
   * Delete product
   */
  delete: (id: string) => 
    apiClient.delete<void>(`/products/${id}`),

  /**
   * Update product status
   */
  updateStatus: (id: string, status: string) =>
    apiClient.patch<Product>(`/products/${id}/status`, { status }),

  /**
   * Get featured products
   */
  getFeatured: () =>
    apiClient.get<Product[]>('/products/featured'),

  /**
   * Set product as featured
   */
  setFeatured: (id: string, featured: boolean) =>
    apiClient.patch<Product>(`/products/${id}/featured`, { featured }),

  /**
   * Toggle product promoted status (appears first in search/categories/styles)
   */
  setPromoted: (id: string, promoted: boolean) =>
    apiClient.patch<Product>(`/products/${id}/promoted`, { promoted }),

  /**
   * Bulk add reviews to a product
   */
  addBulkReviews: (id: string, data: { count: number; name?: string; rating?: number; comment?: string }) =>
    apiClient.post<{ added: number; totalReviews: number; rating: number }>(`/products/${id}/reviews/bulk`, data),
};

