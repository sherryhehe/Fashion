import apiClient from './client';
import { Style } from '@/types';

/**
 * Styles API endpoints
 */
export const stylesApi = {
  /**
   * Get all styles
   */
  getAll: (params?: Record<string, any>) => 
    apiClient.get<Style[]>(`/styles?${new URLSearchParams(params).toString()}`),

  /**
   * Get style by ID
   */
  getById: (id: string) =>
    apiClient.get<Style>(`/styles/${id}`),

  /**
   * Create style
   */
  create: (data: Partial<Style>) => 
    apiClient.post<Style>('/styles', data),

  /**
   * Update style
   */
  update: (id: string, data: Partial<Style>) => 
    apiClient.put<Style>(`/styles/${id}`, data),

  /**
   * Delete style
   */
  delete: (id: string) => 
    apiClient.delete<void>(`/styles/${id}`),
};
