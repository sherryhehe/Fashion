/**
 * Authentication Hooks using TanStack Query
 * Custom hooks for login, register, and auth state management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authService, { LoginCredentials, RegisterData } from '../services/auth.service';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['user'] });
      console.log('Login successful:', data.data.user.name);
    },
    onError: (error: any) => {
      console.log('Login error in hook:', error.message);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['user'] });
      console.log('Registration successful:', data.data.user.name);
    },
    onError: (error: any) => {
      console.log('Registration error in hook:', error.message);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      console.log('Logout successful');
    },
    onError: (error: any) => {
      console.log('Logout error in hook:', error.message);
    },
  });
};

/**
 * Hook to get current user profile
 */
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getProfile(),
    enabled: false, // Don't auto-fetch, call manually when needed
    retry: false,
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: () => {
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      console.log('Update profile error in hook:', error.message);
    },
  });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onError: (error: any) => {
      console.log('Change password error in hook:', error.message);
    },
  });
};

/**
 * Hook to check authentication status
 */
export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['authStatus'],
    queryFn: () => authService.isAuthenticated(),
    staleTime: 0, // Always fresh
  });
};

/**
 * Hook for forgot password
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data) => {
      console.log('Forgot password response:', data);
    },
    onError: (error: any) => {
      console.log('Forgot password error in hook:', error.message);
    },
  });
};

/**
 * Hook for reset password
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ resetToken, newPassword }: { resetToken: string; newPassword: string }) =>
      authService.resetPassword(resetToken, newPassword),
    onSuccess: () => {
      console.log('Password reset successful');
    },
    onError: (error: any) => {
      console.log('Reset password error in hook:', error.message);
    },
  });
};

