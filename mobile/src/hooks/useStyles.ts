/**
 * Style Hooks using TanStack Query
 * Custom hooks for style-related API calls
 */

import { useQuery } from '@tanstack/react-query';
import styleService from '../services/style.service';

/**
 * Hook to get all styles (requires authentication)
 */
export const useStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: () => styleService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes - styles don't change often
  });
};

/**
 * Hook to get a single style by ID (requires authentication)
 */
export const useStyle = (id: string) => {
  return useQuery({
    queryKey: ['style', id],
    queryFn: () => styleService.getById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to get featured styles (public endpoint)
 */
export const useFeaturedStyles = () => {
  return useQuery({
    queryKey: ['styles', 'featured'],
    queryFn: () => styleService.getFeatured(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to get popular styles (public endpoint)
 */
export const usePopularStyles = () => {
  return useQuery({
    queryKey: ['styles', 'popular'],
    queryFn: () => styleService.getPopular(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
