import apiClient from './client';

/**
 * Notifications API endpoints
 */
export const notificationsApi = {
  /**
   * Get all notifications
   */
  getAll: (params?: Record<string, any>) => 
    apiClient.get<any[]>('/notifications', params),

  /**
   * Get notification by ID
   */
  getById: (id: string) => 
    apiClient.get<any>(`/notifications/${id}`),

  /**
   * Create notification
   */
  create: (data: any) => 
    apiClient.post<any>('/notifications', data),

  /**
   * Delete notification
   */
  delete: (id: string) => 
    apiClient.delete<void>(`/notifications/${id}`),

  /**
   * Get notification history
   */
  getHistory: (params?: Record<string, any>) =>
    apiClient.get<any[]>('/notifications/history', params),

  /**
   * Send notification
   */
  send: (id: string) =>
    apiClient.post<any>(`/notifications/${id}/send`),
};

