/**
 * Banner Hooks using TanStack Query
 * Custom hooks for banner-related API calls
 */

import { useQuery } from '@tanstack/react-query';
import bannerService from '../services/banner.service';

/**
 * Hook to get all banners
 */
export const useBanners = (position?: string, status: string = 'active') => {
  return useQuery({
    queryKey: ['banners', position, status],
    queryFn: () => bannerService.getAll(position, status),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: any) => {
      if (__DEV__) {
        console.warn('⚠️ Banners fetch error:', error?.message || error);
      }
    },
    onSuccess: (data) => {
      console.log('✅ Banners fetched successfully:', data?.data?.length || 0, 'banners');
    },
  });
};

/**
 * Hook to get a single banner by ID
 */
export const useBanner = (id: string) => {
  return useQuery({
    queryKey: ['banner', id],
    queryFn: () => bannerService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

