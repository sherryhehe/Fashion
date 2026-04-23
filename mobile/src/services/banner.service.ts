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
    const buildUrl = (pos?: string) => {
      const params = new URLSearchParams();
      if (pos) params.append('position', pos);
      if (status) params.append('status', status);
      const queryString = params.toString();
      return queryString ? `/banners?${queryString}` : '/banners';
    };

    const requestedPositions = (position || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    // Try direct request first (supports backends that handle comma-separated positions)
    const directResponse = await apiClient.get(buildUrl(position));
    if (!requestedPositions.length || requestedPositions.length === 1) {
      return directResponse;
    }
    if (Array.isArray(directResponse?.data) && directResponse.data.length > 0) {
      return directResponse;
    }

    // Fallback for backends that don't support comma-separated positions:
    // fetch each position independently and merge.
    const responses: BannerResponse[] = await Promise.all(
      requestedPositions.map((pos) => apiClient.get(buildUrl(pos)))
    );

    const deduped = new Map<string, Banner>();
    responses.forEach((response) => {
      (response?.data || []).forEach((banner) => {
        const key = banner.id || banner._id || `${banner.title || ''}-${banner.imageUrl || ''}`;
        if (!deduped.has(key)) {
          deduped.set(key, banner);
        }
      });
    });

    return {
      success: true,
      data: Array.from(deduped.values()),
      message: directResponse?.message,
    };
  },

  /**
   * Get banner by ID
   */
  getById: async (id: string): Promise<SingleBannerResponse> => {
    return apiClient.get(`/banners/${id}`);
  },
};

export default bannerService;

