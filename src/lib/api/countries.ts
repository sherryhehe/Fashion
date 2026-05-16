import apiClient from './client';

export const countriesApi = {
  getEligible: () =>
    apiClient.get<any[]>('/countries'),

  add: (data: { code: string; name: string }) =>
    apiClient.post<any>('/countries', data),

  remove: (code: string) =>
    apiClient.delete<void>(`/countries/${code}`),

  update: (code: string, data: { name?: string; isActive?: boolean }) =>
    apiClient.patch<any>(`/countries/${code}`, data),
};
