import apiClient from './client';

/**
 * Brands API endpoints
 */
export const brandsApi = {
  /**
   * Get all brands
   */
  getAll: (params?: Record<string, any>) => 
    apiClient.get<any[]>('/brands', params),

  /**
   * Get brand by ID
   */
  getById: (id: string) => 
    apiClient.get<any>(`/brands/${id}`),

  /**
   * Create brand
   */
  create: (data: any) => 
    apiClient.post<any>('/brands', data),

  /**
   * Update brand
   */
  update: (id: string, data: any) => 
    apiClient.put<any>(`/brands/${id}`, data),

  /**
   * Delete brand
   */
  delete: (id: string) => 
    apiClient.delete<void>(`/brands/${id}`),

  /**
   * Get featured brands
   */
  getFeatured: () =>
    apiClient.get<any[]>('/brands/featured'),

  /**
   * Get top brands
   */
  getTop: (limit?: number) =>
    apiClient.get<any[]>('/brands/top', limit ? { limit } : undefined),
};

