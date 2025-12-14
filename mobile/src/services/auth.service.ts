/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      phone?: string;
    };
    token: string;
  };
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

const authService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Clear guest mode when user logs in
      await AsyncStorage.removeItem('isGuest');
      // Store token and user data
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      // Clear guest mode when user registers
      await AsyncStorage.removeItem('isGuest');
      // Store token and user data
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    return apiClient.get('/auth/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.put('/auth/profile', data);
    
    if (response.success && response.data) {
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    return apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Forgot password - Send reset link
   */
  forgotPassword: async (email: string): Promise<any> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (resetToken: string, newPassword: string): Promise<any> => {
    return apiClient.post('/auth/reset-password', {
      resetToken,
      newPassword,
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('isGuest');
  },

  /**
   * Get stored token
   */
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem('token');
  },

  /**
   * Get stored user data
   */
  getStoredUser: async (): Promise<User | null> => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token');
    const isGuest = await AsyncStorage.getItem('isGuest');
    return !!token || isGuest === 'true';
  },

  /**
   * Enable guest mode
   */
  enableGuestMode: async (): Promise<void> => {
    await AsyncStorage.setItem('isGuest', 'true');
    // Store a minimal guest user object
    const guestUser = {
      id: 'guest',
      name: 'Guest User',
      email: '',
      role: 'guest',
    };
    await AsyncStorage.setItem('user', JSON.stringify(guestUser));
  },

  /**
   * Check if user is in guest mode
   */
  isGuest: async (): Promise<boolean> => {
    const isGuest = await AsyncStorage.getItem('isGuest');
    return isGuest === 'true';
  },

  /**
   * Clear guest mode (when user logs in)
   */
  clearGuestMode: async (): Promise<void> => {
    await AsyncStorage.removeItem('isGuest');
  },
};

export default authService;

