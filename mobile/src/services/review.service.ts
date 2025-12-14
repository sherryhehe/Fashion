import apiClient from './api.service';

export interface ReviewData {
  productId: string;
  rating: number;
  comment: string;
  name: string;
}

export interface ReviewResponse {
  success: boolean;
  data?: any;
  message?: string;
}

const reviewService = {
  /**
   * Add a review to a product
   */
  addReview: async (reviewData: ReviewData): Promise<ReviewResponse> => {
    return apiClient.post('/reviews', reviewData);
  },

  /**
   * Get reviews for a product
   */
  getProductReviews: async (productId: string): Promise<ReviewResponse> => {
    return apiClient.get(`/reviews/product/${productId}`);
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId: string, reviewData: Partial<ReviewData>): Promise<ReviewResponse> => {
    return apiClient.put(`/reviews/${reviewId}`, reviewData);
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<ReviewResponse> => {
    return apiClient.delete(`/reviews/${reviewId}`);
  },
};

export default reviewService;
