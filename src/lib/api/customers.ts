import apiClient from './client';
import { Customer, PaginatedResponse } from '@/types';

/**
 * Customers API endpoints
 */
export const customersApi = {
  /**
   * Get all customers with optional filters
   */
  getAll: (params?: Record<string, any>) => 
    apiClient.get<PaginatedResponse<Customer>>('/customers', params),

  /**
   * Get customer by ID
   */
  getById: (id: string) => 
    apiClient.get<Customer>(`/customers/${id}`),

  /**
   * Update customer
   */
  update: (id: string, data: Partial<Customer>) => 
    apiClient.put<Customer>(`/customers/${id}`, data),

  /**
   * Delete customer
   */
  delete: (id: string) =>
    apiClient.delete<void>(`/customers/${id}`),

  /**
   * Get customer orders
   */
  getOrders: (customerId: string, params?: Record<string, any>) =>
    apiClient.get<any[]>(`/customers/${customerId}/orders`, params),
};

