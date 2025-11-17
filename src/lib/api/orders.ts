import apiClient from './client';
import { Order, PaginatedResponse } from '@/types';

/**
 * Orders API endpoints
 */
export const ordersApi = {
  /**
   * Get all orders with optional filters
   */
  getAll: (params?: Record<string, any>) => 
    apiClient.get<PaginatedResponse<Order>>('/orders', params),

  /**
   * Get order by ID
   */
  getById: (id: string) => 
    apiClient.get<Order>(`/orders/${id}`),

  /**
   * Update order status
   */
  updateStatus: (id: string, status: string) => 
    apiClient.patch<Order>(`/orders/${id}/status`, { status }),

  /**
   * Get recent orders
   */
  getRecent: (limit?: number) =>
    apiClient.get<Order[]>('/orders/recent', limit ? { limit } : undefined),

  /**
   * Cancel order
   */
  cancel: (id: string, reason?: string) =>
    apiClient.post<Order>(`/orders/${id}/cancel`, { reason }),
};

