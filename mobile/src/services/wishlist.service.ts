import apiClient from './api.service';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  data?: WishlistItem[];
  message?: string;
}

const wishlistService = {
  /**
   * Get user's wishlist
   */
  getWishlist: async (): Promise<WishlistResponse> => {
    return apiClient.get('/wishlist');
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (productId: string): Promise<WishlistResponse> => {
    return apiClient.post('/wishlist', { productId });
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId: string): Promise<WishlistResponse> => {
    return apiClient.delete(`/wishlist/${productId}`);
  },

  /**
   * Check if product is in wishlist
   */
  isInWishlist: async (productId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/wishlist/check/${productId}`);
      return response.success && response.data;
    } catch (error) {
      return false;
    }
  },
};

export default wishlistService;
