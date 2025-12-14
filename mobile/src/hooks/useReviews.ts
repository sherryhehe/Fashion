import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import reviewService, { ReviewData } from '../services/review.service';
import { showToast } from '../utils/toast';

/**
 * Hook to get reviews for a product
 */
export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId],
    queryFn: () => reviewService.getProductReviews(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to add a review to a product
 */
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: ReviewData) => reviewService.addReview(reviewData),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Review added successfully!');
        
        // Invalidate product queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['product'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      } else {
        showToast.error(response.message || 'Failed to add review');
      }
    },
    onError: (error: any) => {
      console.log('Add review error:', error);
      showToast.error(error.message || 'Failed to add review');
    },
  });
};

/**
 * Hook to update a review
 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, reviewData }: { reviewId: string; reviewData: Partial<ReviewData> }) =>
      reviewService.updateReview(reviewId, reviewData),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Review updated successfully!');
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['product'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } else {
        showToast.error(response.message || 'Failed to update review');
      }
    },
    onError: (error: any) => {
      console.log('Update review error:', error);
      showToast.error(error.message || 'Failed to update review');
    },
  });
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Review deleted successfully!');
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['product'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } else {
        showToast.error(response.message || 'Failed to delete review');
      }
    },
    onError: (error: any) => {
      console.log('Delete review error:', error);
      showToast.error(error.message || 'Failed to delete review');
    },
  });
};
