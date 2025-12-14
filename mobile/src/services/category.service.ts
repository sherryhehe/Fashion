/**
 * Category Service
 * Handles all category-related API calls
 */

import apiClient from './api.service';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

export interface SingleCategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

const categoryService = {
  /**
   * Get all categories (public endpoint - no auth required)
   */
  getAll: async (): Promise<CategoryResponse> => {
    return apiClient.get('/categories');
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<SingleCategoryResponse> => {
    return apiClient.get(`/categories/${id}`);
  },
};

export default categoryService;
