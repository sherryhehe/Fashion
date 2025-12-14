import apiClient from './api.service';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  addedAt: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemData {
  quantity: number;
  size?: string;
  color?: string;
}

export interface CartResponse {
  success: boolean;
  data?: CartItem[];
  message?: string;
}

const cartService = {
  /**
   * Get user's cart
   */
  getCart: async (): Promise<CartResponse> => {
    return apiClient.get('/cart');
  },

  /**
   * Add item to cart
   */
  addToCart: async (data: AddToCartData): Promise<CartResponse> => {
    return apiClient.post('/cart', data);
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (cartItemId: string, data: UpdateCartItemData): Promise<CartResponse> => {
    return apiClient.put(`/cart/${cartItemId}`, data);
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (cartItemId: string): Promise<CartResponse> => {
    return apiClient.delete(`/cart/${cartItemId}`);
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<CartResponse> => {
    return apiClient.delete('/cart/clear/all');
  },
};

export default cartService;
