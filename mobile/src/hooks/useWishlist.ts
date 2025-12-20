import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wishlistService from '../services/wishlist.service';
import { showToast } from '../utils/toast';

/**
 * Hook to get user's wishlist
 * Cache persists in memory and will be available even after login
 */
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes - cache persists for 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
};

/**
 * Hook to add product to wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, color, size }: { productId: string; color?: string; size?: string }) => 
      wishlistService.addToWishlist(productId, color, size),
    onMutate: async ({ productId, color, size }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      // Optimistically update the cache
      queryClient.setQueryData(['wishlist'], (old: any) => {
        // If wishlist hasn't been fetched yet, create initial structure
        if (!old) {
          return {
            success: true,
            data: [{
              productId,
              product: { _id: productId },
              color,
              size,
              _id: `temp-${productId}`, // Temporary ID
            }]
          };
        }
        
        if (!old.data) {
          return {
            ...old,
            data: [{
              productId,
              product: { _id: productId },
              color,
              size,
              _id: `temp-${productId}`,
            }]
          };
        }
        
        // Check if item already exists
        const exists = old.data.some((w: any) => 
          w.productId === productId || w.product?._id === productId
        );
        
        if (exists) return old; // Already in wishlist
        
        // Add new item optimistically
        return {
          ...old,
          data: [
            ...old.data,
            {
              productId,
              product: { _id: productId },
              color,
              size,
              _id: `temp-${productId}`, // Temporary ID
            }
          ]
        };
      });

      // Optimistically update individual product checks
      queryClient.setQueryData(['wishlist', 'check', productId], { data: true, success: true });

      // Return context with the snapshotted value
      return { previousWishlist };
    },
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Added to wishlist!');
        // Refetch to get the actual data from server
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist', 'check'] });
      } else {
        showToast.error(response.message || 'Failed to add to wishlist');
      }
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
      queryClient.setQueryData(['wishlist', 'check', variables.productId], { data: false, success: true });
      console.log('Add to wishlist error:', error);
      showToast.error(error.message || 'Failed to add to wishlist');
    },
  });
};

/**
 * Hook to remove product from wishlist
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      // Optimistically update the cache
      queryClient.setQueryData(['wishlist'], (old: any) => {
        // If wishlist hasn't been fetched yet or has no data, return as is
        if (!old || !old.data) return old;
        
        // Filter out the removed item
        return {
          ...old,
          data: old.data.filter((w: any) => 
            w.productId !== productId && w.product?._id !== productId
          )
        };
      });

      // Optimistically update individual product checks
      queryClient.setQueryData(['wishlist', 'check', productId], { data: false, success: true });

      // Return context with the snapshotted value
      return { previousWishlist };
    },
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Removed from wishlist');
        // Refetch to get the actual data from server
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist', 'check'] });
      } else {
        showToast.error(response.message || 'Failed to remove from wishlist');
      }
    },
    onError: (error: any, productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
      queryClient.setQueryData(['wishlist', 'check', productId], { data: true, success: true });
      console.log('Remove from wishlist error:', error);
      showToast.error(error.message || 'Failed to remove from wishlist');
    },
  });
};

/**
 * Hook to check if product is in wishlist
 */
export const useIsInWishlist = (productId: string) => {
  return useQuery({
    queryKey: ['wishlist', 'check', productId],
    queryFn: () => wishlistService.isInWishlist(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
