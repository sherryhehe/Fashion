/**
 * Category Hooks using TanStack Query
 * Custom hooks for category-related API calls
 */

import { useQuery } from '@tanstack/react-query';
import categoryService from '../services/category.service';

/**
 * Hook to get all categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
    onError: (error: any) => {
      if (__DEV__) {
        console.warn('⚠️ Categories fetch error:', error?.message || error);
      }
    },
    onSuccess: (data) => {
      console.log('✅ Categories fetched successfully:', data?.data?.length || 0, 'categories');
    },
  });
};

/**
 * Hook to get a single category by ID
 */
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
