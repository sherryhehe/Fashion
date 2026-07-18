/**
 * Payment Method Service
 * Fetches admin-configured custom payment methods (Bank Transfer, JazzCash, etc.)
 * shown to customers at checkout. Public endpoint - no auth required.
 */

import apiClient from './api.service';

export interface PaymentMethod {
  _id: string;
  name: string;
  instructions: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethod[];
  message?: string;
}

const paymentMethodService = {
  /**
   * Get all payment methods (public). Returns the full list including inactive.
   */
  getAll: async (): Promise<PaymentMethodResponse> => {
    return apiClient.get('/payment-methods');
  },

  /**
   * Get only active payment methods (the ones customers should see).
   */
  getActive: async (): Promise<PaymentMethod[]> => {
    const res = (await apiClient.get('/payment-methods')) as any;
    const list: PaymentMethod[] = res?.data ?? res ?? [];
    return Array.isArray(list) ? list.filter((m) => m && m.isActive !== false) : [];
  },
};

export default paymentMethodService;
