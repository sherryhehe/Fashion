/**
 * Product Hooks using TanStack Query
 * Custom hooks for product-related API calls
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import productService, { ProductFilters } from '../services/product.service';

const BOTTOM_GRID_PAGE_SIZE = 20;

/**
 * Hook to get all products with filters
 */
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      if (__DEV__) {
        console.warn('⚠️ Products fetch error:', error?.message || error);
      }
    },
    onSuccess: (data) => {
      console.log('✅ Products fetched successfully:', data?.data?.length || 0, 'products');
    },
  });
};

/**
 * Hook to get a single product by ID
 */
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get featured products
 */
export const useFeaturedProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productService.getFeatured(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get recommended products
 */
export const useRecommendedProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['products', 'recommended', limit],
    queryFn: () => productService.getRecommended(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to get personalized products (cart + wishlist first, then featured).
 * Only runs when enabled (e.g. when user is logged in).
 */
export const usePersonalizedProducts = (limit: number = 10, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['products', 'personalized', limit],
    queryFn: () => productService.getPersonalized(limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get recently added products
 */
export const useRecentlyAddedProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['products', 'recently-added', limit],
    queryFn: () => productService.getRecentlyAdded(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get top selling products
 */
export const useTopSellingProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['products', 'top-selling', limit],
    queryFn: () => productService.getTopSelling(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to search products
 */
export const useProductSearch = (query: string, filters: Omit<ProductFilters, 'search'> = {}) => {
  return useQuery({
    queryKey: ['products', 'search', query, filters],
    queryFn: () => productService.search(query, filters),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Infinite query for homepage bottom grid - load more as user scrolls.
 * Sorted by recently added (createdAt desc); products appear in consistent order per page.
 */
export const useInfiniteProducts = (filters: Omit<ProductFilters, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const res = await productService.getAll({
        ...filters,
        page: pageParam,
        limit: BOTTOM_GRID_PAGE_SIZE,
        sortBy: 'createdAt',
        order: 'desc',
      });
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage?.pagination;
      if (!p || p.page >= p.totalPages) return undefined;
      return p.page + 1;
    },
    staleTime: 5 * 60 * 1000,
  });
};
