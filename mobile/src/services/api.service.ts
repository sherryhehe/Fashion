/**
 * Base API Service
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';
import { getNetworkErrorMessage, shouldRetryRequest } from '../utils/networkHelper';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Initial delay in ms

/**
 * Retry a failed request with exponential backoff
 * @param error The axios error
 * @param retryCount Current retry attempt
 * @returns Promise that resolves when retry is successful or rejects after max retries
 */
const retryRequest = async (error: AxiosError, retryCount: number = 0): Promise<any> => {
  const config = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
  
  // Don't retry if max retries reached or request already retried
  if (!config || config._retry || retryCount >= MAX_RETRIES) {
    return Promise.reject(error);
  }
  
  // Only retry on network errors (no response)
  if (!shouldRetryRequest(error)) {
    return Promise.reject(error);
  }
  
  // Mark request as retrying
  config._retry = true;
  config._retryCount = retryCount + 1;
  
  // Calculate delay with exponential backoff
  const delay = RETRY_DELAY * Math.pow(2, retryCount);
  
  if (__DEV__) {
    console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms...`);
  }
  
  // Wait before retrying
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Retry the request
  return apiClient(config);
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slower connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach JWT token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Log API requests in dev mode
      if (__DEV__) {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      }
    } catch (error) {
      // Silent fail - token not available
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in dev mode
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    // Return the data directly for successful responses
    return response.data;
  },
  async (error: AxiosError) => {
    // Handle network errors and timeouts first (no response)
    if (!error.response) {
      const errorCode = error.code || 'UNKNOWN';
      const errorMsg = error.message || 'Unknown network error';
      
      // Use network helper for better error messages
      const errorMessage = getNetworkErrorMessage(errorCode, errorMsg);
      
      // Log network errors using console.warn instead of console.error
      // This prevents React Native from showing error overlay for network issues
      if (__DEV__) {
        const logDetails = error.config ? {
          method: error.config.method ? error.config.method.toUpperCase() : 'UNKNOWN',
          baseURL: error.config.baseURL || 'N/A',
          url: error.config.url || 'N/A',
          fullURL: `${error.config.baseURL || ''}${error.config.url || ''}`,
        } : null;

        // Use console.warn to avoid triggering React Native error overlay
        console.warn('⚠️ Network Error:', {
          message: 'No response from server',
          code: errorCode,
          errorMessage: errorMsg,
          ...(logDetails && { request: logDetails }),
        });
      }
      
      // Try to retry the request if it's retryable
      const config = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
      if (config && !config._retry && shouldRetryRequest(error)) {
        return retryRequest(error, config._retryCount || 0);
      }
      
      // If retry failed or not retryable, reject with error
      return Promise.reject({
        message: errorMessage,
        status: 0,
        code: errorCode,
        data: null,
      });
    }

    const is401 = error.response.status === 401;
    const errorData = error.response.data as any;
    const isNoTokenError = errorData?.error === 'No token provided';
    
    // Don't log errors for expected 401s (when user is not authenticated)
    // Only log if it's an unexpected 401 (token expired/invalid) or other errors
    // Use console.warn to avoid triggering React Native error overlay
    if (__DEV__) {
      if (!is401 || (is401 && !isNoTokenError)) {
        const requestInfo = error.config ? {
          method: error.config.method?.toUpperCase() || 'UNKNOWN',
          url: `${error.config.baseURL || ''}${error.config.url || ''}`,
        } : { method: 'UNKNOWN', url: 'Request config not available' };

        console.warn('⚠️ API Error:', {
          ...requestInfo,
          status: error.response?.status || 'Unknown',
          errorData: errorData || 'No error data',
          errorMessage: error.message || 'Unknown error',
        });
      }
    }

    // Handle 401 Unauthorized - Token expired or invalid
    // Only clear tokens if it's NOT a "No token provided" error (which means token was invalid/expired)
    if (is401 && !isNoTokenError) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        if (__DEV__) {
          console.log('🔐 Token expired or invalid, user logged out');
        }
      } catch (storageError) {
        // Silent fail
      }
    }

    // Network errors already handled above, remove duplicate

    // Return structured error with better error message extraction
    // Note: errorData is already declared above (line 53)
    let errorMessage = 'Something went wrong';
    
    // Try to extract error message from different possible formats
    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.join(', ');
      } else if (errorData.errors && typeof errorData.errors === 'object') {
        // Handle Mongoose validation errors
        const errorMessages = Object.values(errorData.errors).map((err: any) => err.message || err);
        errorMessage = errorMessages.join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: errorData,
    });
  }
);

export default apiClient;

