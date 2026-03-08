/**
 * Home categories (custom homepage sections) - public API for app
 */
import apiClient from './api.service';

export interface HomeCategoryWithProducts {
  _id: string;
  name: string;
  slug?: string;
  order: number;
  products: any[];
}

const homeCategoryService = {
  getActiveForApp: async (): Promise<{ success: boolean; data: HomeCategoryWithProducts[] }> => {
    return apiClient.get('/home-categories/app');
  },
};

export default homeCategoryService;
