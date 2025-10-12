import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * HTTP methods
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request configuration
 */
interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API client with error handling and interceptors
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set default header
   */
  setHeader(key: string, value: string) {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remove default header
   */
  removeHeader(key: string) {
    delete this.defaultHeaders[key];
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.setHeader('Authorization', `Bearer ${token}`);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.removeHeader('Authorization');
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Debug logging
    console.log('🔧 API Client Request:');
    console.log('  URL:', url);
    console.log('  Method:', config.method);
    console.log('  Token exists:', !!token);
    console.log('  Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
    console.log('  Headers:', { ...this.defaultHeaders, ...authHeaders, ...config.headers });
    
    try {
      const response = await fetch(url, {
        method: config.method,
        headers: { ...this.defaultHeaders, ...authHeaders, ...config.headers },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.signal,
      });

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError('Network error. Please check your connection.', 0);
      }

      // Handle abort errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request cancelled', 0);
      }

      throw new ApiError('An unexpected error occurred', 0);
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string, 
    params?: Record<string, any>,
    options?: { signal?: AbortSignal; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(endpoint + queryString, { 
      method: 'GET', 
      headers: options?.headers,
      signal: options?.signal
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    options?: { signal?: AbortSignal; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'POST', 
      body: data, 
      headers: options?.headers,
      signal: options?.signal
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string, 
    data?: any, 
    options?: { signal?: AbortSignal; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'PUT', 
      body: data, 
      headers: options?.headers,
      signal: options?.signal
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string, 
    data?: any, 
    options?: { signal?: AbortSignal; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'PATCH', 
      body: data, 
      headers: options?.headers,
      signal: options?.signal
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string, 
    options?: { signal?: AbortSignal; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'DELETE', 
      headers: options?.headers,
      signal: options?.signal
    });
  }
}

// Create and export API client instance
const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;

