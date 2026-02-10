import apiClient from './client';
import { DashboardStats, ChartData } from '@/types';

/**
 * Dashboard API endpoints
 */
export const dashboardApi = {
  /**
   * Get dashboard stats
   */
  getStats: (period?: string) => 
    apiClient.get<DashboardStats>('/dashboard/stats', period ? { period } : undefined),

  /**
   * Get chart data
   */
  getChartData: (type: string, period: string) => 
    apiClient.get<ChartData>(`/dashboard/charts/${type}`, { period }),

  /**
   * Get sales analytics
   */
  getSalesAnalytics: (params?: Record<string, any>) =>
    apiClient.get<any>('/dashboard/sales', params),

  /**
   * Get finance analytics
   */
  getFinanceAnalytics: (params?: Record<string, any>) =>
    apiClient.get<any>('/dashboard/finance', params),
};

