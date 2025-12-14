import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cartService, { AddToCartData, UpdateCartItemData } from '../services/cart.service';
import { showToast } from '../utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

/**
 * Hook to check if user is authenticated
 */
const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsAuthenticated(!!token);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isChecking };
};

/**
 * Hook to get user's cart (only runs if user is authenticated)
 */
export const useCart = () => {
  const { isAuthenticated, isChecking } = useIsAuthenticated();

  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: !isChecking && isAuthenticated, // Only fetch if authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to add item to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartData) => cartService.addToCart(data),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Added to cart!');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        showToast.error(response.message || 'Failed to add to cart');
      }
    },
    onError: (error: any) => {
      console.log('Add to cart error:', error);
      showToast.error(error.message || 'Failed to add to cart');
    },
  });
};

/**
 * Hook to update cart item
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, data }: { cartItemId: string; data: UpdateCartItemData }) =>
      cartService.updateCartItem(cartItemId, data),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Cart updated');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        showToast.error(response.message || 'Failed to update cart');
      }
    },
    onError: (error: any) => {
      console.log('Update cart item error:', error);
      showToast.error(error.message || 'Failed to update cart');
    },
  });
};

/**
 * Hook to remove item from cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => cartService.removeFromCart(cartItemId),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Removed from cart');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        showToast.error(response.message || 'Failed to remove from cart');
      }
    },
    onError: (error: any) => {
      console.log('Remove from cart error:', error);
      showToast.error(error.message || 'Failed to remove from cart');
    },
  });
};

/**
 * Hook to clear cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Cart cleared');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        showToast.error(response.message || 'Failed to clear cart');
      }
    },
    onError: (error: any) => {
      console.log('Clear cart error:', error);
      showToast.error(error.message || 'Failed to clear cart');
    },
  });
};
