import apiClient from './client';

export const paymentMethodsApi = {
  getAll: (params?: Record<string, any>) =>
    apiClient.get<any[]>('/payment-methods', params),

  getById: (id: string) =>
    apiClient.get<any>(`/payment-methods/${id}`),

  create: (data: { name: string; instructions: string; isActive?: boolean }) =>
    apiClient.post<any>('/payment-methods', data),

  update: (id: string, data: { name?: string; instructions?: string; isActive?: boolean }) =>
    apiClient.put<any>(`/payment-methods/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/payment-methods/${id}`),
};
