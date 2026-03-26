import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { getApiUrl } from '@/utils/apiHelper';

// Get API URL with proper fallback
const getApiUrlSafe = (): string => {
  return getApiUrl();
};

const isDev = () => typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper to make API requests
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const headers = getAuthHeaders();
  
  const apiUrl = getApiUrlSafe();
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      if (isDev()) console.warn('Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }

  return data.data;
};

// =====================================================
// PRODUCTS
// =====================================================

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiRequest('/products'),
  });
};

export const useProduct = (id: string | null) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiRequest(`/products/${id}`),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (productData: any) =>
      apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

// =====================================================
// CATEGORIES
// =====================================================

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest('/categories'),
  });
};

export const useCategory = (id: string | null) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => apiRequest(`/categories/${id}`),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: (categoryData: any) =>
      apiRequest('/categories', { method: 'POST', body: JSON.stringify(categoryData) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

// Style hooks
export const useStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: () => apiRequest('/styles'),
  });
};

export const useCreateStyle = () => {
  return useMutation({
    mutationFn: (styleData: any) =>
      apiRequest('/styles', { method: 'POST', body: JSON.stringify(styleData) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['styles'] }),
  });
};

// Brand hooks
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => apiRequest('/brands?status=active'),
  });
};

export const useCreateBrand = () => {
  return useMutation({
    mutationFn: (brandData: any) =>
      apiRequest('/brands', { method: 'POST', body: JSON.stringify(brandData) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });
};

// =====================================================
// HOME CATEGORIES (custom homepage sections)
// =====================================================

export const useHomeCategories = () => {
  return useQuery({
    queryKey: ['home-categories'],
    queryFn: () => apiRequest('/home-categories'),
  });
};

export const useHomeCategory = (id: string | null) => {
  return useQuery({
    queryKey: ['home-category', id],
    queryFn: () => apiRequest(`/home-categories/${id}`),
    enabled: !!id,
  });
};

export const useCreateHomeCategory = () => {
  return useMutation({
    mutationFn: (data: any) =>
      apiRequest('/home-categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home-categories'] }),
  });
};

export const useUpdateHomeCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/home-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home-categories'] }),
  });
};

export const useDeleteHomeCategory = () => {
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/home-categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home-categories'] }),
  });
};

// =====================================================
// BANNERS
// =====================================================

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: () => apiRequest('/banners'),
  });
};

export const useBanner = (id: string | null) => {
  return useQuery({
    queryKey: ['banners', id],
    queryFn: () => apiRequest(`/banners/${id}`),
    enabled: !!id,
  });
};

export const useCreateBanner = () => {
  return useMutation({
    mutationFn: (bannerData: any) =>
      apiRequest('/banners', { method: 'POST', body: JSON.stringify(bannerData) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  });
};

export const useUpdateBanner = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  });
};

export const useDeleteBanner = () => {
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/banners/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  });
};

// =====================================================
// ORDERS
// =====================================================

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiRequest('/orders'),
  });
};

// =====================================================
// USERS/CUSTOMERS
// =====================================================

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiRequest('/users'),
  });
};

// =====================================================
// SETTINGS (payment, etc.)
// =====================================================

export const usePaymentSettings = () => {
  return useQuery({
    queryKey: ['settings', 'payment'],
    queryFn: () => apiRequest('/settings/payment'),
  });
};

export const useUpdatePaymentSettings = () => {
  return useMutation({
    mutationFn: (data: { currency?: string }) =>
      apiRequest('/settings/payment', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'payment'] }),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  });
};

// =====================================================
// DASHBOARD
// =====================================================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiRequest('/dashboard/stats'),
  });
};


