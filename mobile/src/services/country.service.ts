/**
 * Country Service
 * Fetches admin-configured eligible countries for signup / checkout.
 * Public endpoint - no auth required.
 */

import apiClient from './api.service';

export interface Country {
  _id?: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CountryResponse {
  success: boolean;
  data: Country[];
  message?: string;
}

const countryService = {
  /**
   * Get all countries (public).
   */
  getAll: async (): Promise<CountryResponse> => {
    return apiClient.get('/countries');
  },

  /**
   * Get only active (eligible) countries, sorted by name.
   */
  getActive: async (): Promise<Country[]> => {
    const res = (await apiClient.get('/countries')) as any;
    const list: Country[] = res?.data ?? res ?? [];
    return Array.isArray(list)
      ? list.filter((c) => c && c.isActive !== false).sort((a, b) => a.name.localeCompare(b.name))
      : [];
  },
};

export default countryService;
