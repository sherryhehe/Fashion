import apiClient from './client';

export interface HomeCategory {
  _id: string;
  name: string;
  slug?: string;
  order: number;
  productIds: string[];
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Home (featured) categories - the custom sections shown on the app home screen.
 */
export const homeCategoriesApi = {
  getAll: (params?: Record<string, any>) =>
    apiClient.get<HomeCategory[]>('/home-categories', params),

  getById: (id: string) =>
    apiClient.get<HomeCategory>(`/home-categories/${id}`),

  create: (data: { name: string; order?: number; productIds?: string[]; status?: string }) =>
    apiClient.post<HomeCategory>('/home-categories', data),

  update: (
    id: string,
    data: { name?: string; order?: number; productIds?: string[]; status?: string }
  ) => apiClient.put<HomeCategory>(`/home-categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/home-categories/${id}`),
};
