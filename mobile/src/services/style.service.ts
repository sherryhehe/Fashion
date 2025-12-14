/**
 * Style Service
 * Handles all style-related API calls
 */

import apiClient from './api.service';

export interface Style {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StyleResponse {
  success: boolean;
  data: Style[];
  message?: string;
}

export interface SingleStyleResponse {
  success: boolean;
  data: Style;
  message?: string;
}

const styleService = {
  /**
   * Get all styles (requires authentication)
   */
  getAll: async (): Promise<StyleResponse> => {
    return apiClient.get('/styles');
  },

  /**
   * Get style by ID (requires authentication)
   */
  getById: async (id: string): Promise<SingleStyleResponse> => {
    return apiClient.get(`/styles/${id}`);
  },

  /**
   * Get featured styles (public endpoint)
   */
  getFeatured: async (): Promise<StyleResponse> => {
    return apiClient.get('/styles/featured');
  },

  /**
   * Get popular styles (public endpoint)
   */
  getPopular: async (): Promise<StyleResponse> => {
    return apiClient.get('/styles/popular');
  },
};

export default styleService;
