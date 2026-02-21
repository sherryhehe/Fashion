/**
 * Shared utility for uploading images with proper error handling and timeout
 */
import { getApiUrl } from './apiHelper';

export interface UploadResult {
  success: boolean;
  url?: string;
  urls?: string[];
  error?: string;
}

/**
 * Upload a single image file
 */
export const uploadImage = async (file: File, apiUrl?: string): Promise<string> => {
  const uploadFormData = new FormData();
  uploadFormData.append('images', file);
  
  const token = localStorage.getItem('token');
  const baseUrl = apiUrl || getApiUrl();
  
  // Create timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 30000); // 30 second timeout
  
  try {
    const uploadResponse = await fetch(`${baseUrl}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadFormData,
      signal: timeoutController.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!uploadResponse.ok) {
      let errorMessage = `Upload failed with status ${uploadResponse.status}`;
      try {
        const errorData = await uploadResponse.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }
    
    const uploadResult = await uploadResponse.json();
    if (!uploadResult.success || !uploadResult.data?.urls?.[0]) {
      throw new Error('Invalid response from upload endpoint');
    }
    
    return uploadResult.data.urls[0];
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError' || timeoutController.signal.aborted) {
      throw new Error('Upload timeout - please try again');
    }
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      throw new Error('Network error: Please check your connection and try again');
    }
    throw error;
  }
};

/**
 * Upload multiple image files
 */
export const uploadImages = async (files: File[], apiUrl?: string): Promise<string[]> => {
  if (files.length === 0) return [];
  
  const uploadFormData = new FormData();
  files.forEach(file => {
    uploadFormData.append('images', file);
  });
  
  const token = localStorage.getItem('token');
  const baseUrl = apiUrl || getApiUrl();
  
  // Create timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 60000); // 60 second timeout for multiple files
  
  try {
    const uploadResponse = await fetch(`${baseUrl}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadFormData,
      signal: timeoutController.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!uploadResponse.ok) {
      let errorMessage = `Upload failed with status ${uploadResponse.status}`;
      try {
        const errorData = await uploadResponse.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }
    
    const uploadResult = await uploadResponse.json();
    if (!uploadResult.success || !uploadResult.data?.urls) {
      throw new Error('Invalid response from upload endpoint');
    }
    
    return uploadResult.data.urls;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError' || timeoutController.signal.aborted) {
      throw new Error('Upload timeout - please try again');
    }
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      throw new Error('Network error: Please check your connection and try again');
    }
    throw error;
  }
};

