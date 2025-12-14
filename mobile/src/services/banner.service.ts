/**
 * Banner Service
 * API calls for banner management
 */

import apiClient from './api.service';

export interface Banner {
  id: string;
  _id?: string; // MongoDB _id
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string; // Legacy field name
  imageUrl?: string; // Backend returns this
  link?: string; // Legacy field name
  linkUrl?: string; // Backend returns this
  position?: string;
  status: 'active' | 'inactive' | 'draft';
  order?: number;
  clicks?: number;
  ctr?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
  message?: string;
}

export interface SingleBannerResponse {
  success: boolean;
  data: Banner;
  message?: string;
}

const bannerService = {
  /**
   * Get all banners (public endpoint)
   */
  getAll: async (position?: string, status: string = 'active'): Promise<BannerResponse> => {
    const params = new URLSearchParams();
    if (position) params.append('position', position);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const url = queryString ? `/banners?${queryString}` : '/banners';
    
    return apiClient.get(url);
  },

  /**
   * Get banner by ID
   */
  getById: async (id: string): Promise<SingleBannerResponse> => {
    return apiClient.get(`/banners/${id}`);
  },
};

export default bannerService;

