import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderService, { CreateOrderData } from '../services/order.service';
import { showToast } from '../utils/toast';

/**
 * Hook to get user's orders
 */
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get order by ID
 */
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => orderService.createOrder(data),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Order placed successfully!', 'Order Confirmed');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] }); // Clear cart after order
      } else {
        showToast.error(response.message || 'Failed to place order');
      }
    },
    onError: (error: any) => {
      console.log('Create order error:', error);
      showToast.error(error.message || 'Failed to place order');
    },
  });
};

/**
 * Hook to confirm order payment (after Stripe Payment Sheet succeeds).
 */
export const useConfirmOrderPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderService.confirmPayment(orderId),
    onSuccess: (_response, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: (response) => {
      if (response.success) {
        showToast.success('Order cancelled successfully');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      } else {
        showToast.error(response.message || 'Failed to cancel order');
      }
    },
    onError: (error: any) => {
      console.log('Cancel order error:', error);
      showToast.error(error.message || 'Failed to cancel order');
    },
  });
};

