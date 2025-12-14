/**
 * Brand Hooks using TanStack Query
 * Custom hooks for brand-related API calls
 */

import { useQuery } from '@tanstack/react-query';
import brandService from '../services/brand.service';

/**
 * Hook to get all brands (requires authentication)
 */
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes - brands don't change often
  });
};

/**
 * Hook to get a single brand by ID (requires authentication)
 */
export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => brandService.getById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to get featured brands (public endpoint)
 */
export const useFeaturedBrands = () => {
  return useQuery({
    queryKey: ['brands', 'featured'],
    queryFn: () => brandService.getFeatured(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to get top brands (public endpoint)
 */
export const useTopBrands = () => {
  return useQuery({
    queryKey: ['brands', 'top'],
    queryFn: () => brandService.getTopBrands(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    onError: (error: any) => {
      if (__DEV__) {
        console.warn('⚠️ Top Brands fetch error:', error?.message || error);
      }
    },
    onSuccess: (data) => {
      console.log('✅ Top Brands fetched successfully:', data?.data?.length || 0, 'brands');
    },
  });
};

/**
 * Hook to get brand by name
 */
export const useBrandByName = (name: string) => {
  return useQuery({
    queryKey: ['brand', 'name', name],
    queryFn: () => brandService.getByName(name),
    enabled: !!name,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
