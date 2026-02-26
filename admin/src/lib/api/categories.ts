import apiClient from './client';
import { Category } from '@/types';

/**
 * Categories API endpoints
 */
export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: (params?: Record<string, any>) =>
    apiClient.get<Category[]>('/categories', params),

  /**
   * Get category by ID
   */
  getById: (id: string) =>
    apiClient.get<Category>(`/categories/${id}`),

  /**
   * Create category
   */
  create: (data: Partial<Category>) => 
    apiClient.post<Category>('/categories', data),

  /**
   * Update category
   */
  update: (id: string, data: Partial<Category>) => 
    apiClient.put<Category>(`/categories/${id}`, data),

  /**
   * Delete category
   */
  delete: (id: string) => 
    apiClient.delete<void>(`/categories/${id}`),
};

