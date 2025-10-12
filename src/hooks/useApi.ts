import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  console.log('🔐 Getting auth headers...');
  console.log('  Token exists:', !!token);
  console.log('  Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper to make API requests
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const headers = getAuthHeaders();
  
  console.log('📡 API Request:');
  console.log('  URL:', `${API_URL}${endpoint}`);
  console.log('  Method:', options?.method || 'GET');
  console.log('  Headers:', headers);
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  const data = await response.json();
  
  console.log('📥 API Response:');
  console.log('  Status:', response.status);
  console.log('  Data:', data);

  if (!response.ok) {
    if (response.status === 401) {
      console.error('🔐 Unauthorized - clearing token');
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
    mutationFn: (productData: any) => {
      console.log('📤 CREATE PRODUCT MUTATION');
      console.log('  Data:', productData);
      return apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },
    onSuccess: () => {
      console.log('✅ Product created - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      console.log('📤 UPDATE PRODUCT MUTATION');
      console.log('  ID:', id);
      console.log('  Data:', data);
      return apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      console.log('✅ Product updated - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: (id: string) => {
      console.log('🗑️ DELETE PRODUCT MUTATION');
      console.log('  ID:', id);
      return apiRequest(`/products/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      console.log('✅ Product deleted - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
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
    mutationFn: (categoryData: any) => {
      console.log('📤 CREATE CATEGORY MUTATION');
      console.log('  Data:', categoryData);
      return apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
    },
    onSuccess: () => {
      console.log('✅ Category created - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      console.log('📤 UPDATE CATEGORY MUTATION');
      console.log('  ID:', id);
      console.log('  Data:', data);
      return apiRequest(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      console.log('✅ Category updated - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: (id: string) => {
      console.log('🗑️ DELETE CATEGORY MUTATION');
      console.log('  ID:', id);
      return apiRequest(`/categories/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      console.log('✅ Category deleted - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
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
    mutationFn: (styleData: any) => {
      console.log('📤 CREATE STYLE MUTATION');
      console.log('  Data:', styleData);
      return apiRequest('/styles', {
        method: 'POST',
        body: JSON.stringify(styleData),
      });
    },
    onSuccess: () => {
      console.log('✅ Style created - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['styles'] });
    },
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
    mutationFn: (brandData: any) => {
      console.log('📤 CREATE BRAND MUTATION');
      console.log('  Data:', brandData);
      return apiRequest('/brands', {
        method: 'POST',
        body: JSON.stringify(brandData),
      });
    },
    onSuccess: () => {
      console.log('✅ Brand created - invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
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
// DASHBOARD
// =====================================================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiRequest('/dashboard/stats'),
  });
};


