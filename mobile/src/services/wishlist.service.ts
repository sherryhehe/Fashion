import apiClient from './api.service';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  color?: string | null;
  size?: string | null;
  addedAt: string;
  product?: any; // Product details populated from backend
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
  addToWishlist: async (productId: string, color?: string, size?: string): Promise<WishlistResponse> => {
    const id = productId != null ? String(productId).trim() : '';
    return apiClient.post('/wishlist', { productId: id, color, size });
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
