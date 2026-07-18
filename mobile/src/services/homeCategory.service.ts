/**
 * Home categories (custom homepage sections) - public API for app
 */
import apiClient from './api.service';
import { getUserCountry } from '../utils/userCountry';

export interface HomeCategoryWithProducts {
  _id: string;
  name: string;
  slug?: string;
  order: number;
  products: any[];
}

const homeCategoryService = {
  getActiveForApp: async (): Promise<{ success: boolean; data: HomeCategoryWithProducts[] }> => {
    const country = await getUserCountry();
    return apiClient.get(country ? `/home-categories/app?country=${encodeURIComponent(country)}` : '/home-categories/app');
  },
};

export default homeCategoryService;
