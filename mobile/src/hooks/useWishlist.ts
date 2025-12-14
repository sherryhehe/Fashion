import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wishlistService from '../services/wishlist.service';
import { showToast } from '../utils/toast';

/**
 * Hook to get user's wishlist
 */
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to add product to wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Added to wishlist!');
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      } else {
        showToast.error(response.message || 'Failed to add to wishlist');
      }
    },
    onError: (error: any) => {
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
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Removed from wishlist');
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      } else {
        showToast.error(response.message || 'Failed to remove from wishlist');
      }
    },
    onError: (error: any) => {
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
