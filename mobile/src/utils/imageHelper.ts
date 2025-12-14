/**
 * Image Helper Utilities
 * Converts backend image paths to full URLs with caching support
 */

// Import centralized API configuration
import { IMAGE_BASE_URL } from '../config/apiConfig';

/**
 * Converts a backend image path to a full URL
 * @param imagePath - Image path from backend (e.g., "/uploads/image.jpg")
 * @returns Full URL or null if invalid
 */
export const getImageUrl = (imagePath?: string | null): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Ensure imagePath starts with / for proper URL construction
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Convert relative path to full URL
  const fullUrl = `${IMAGE_BASE_URL}${normalizedPath}`;
  
  return fullUrl;
};

/**
 * Gets an image source object for React Native Image component
 * @param imagePath - Image path from backend
 * @param fallback - Local fallback image (require statement)
 * @returns Image source object
 */
export const getImageSource = (imagePath?: string | null, fallback?: any) => {
  // Check if imagePath is valid (not null, undefined, or empty string)
  if (!imagePath || (typeof imagePath === 'string' && imagePath.trim() === '')) {
    return fallback || null;
  }
  
  const url = getImageUrl(imagePath);
  
  if (url) {
    return { uri: url };
  }
  
  // If URL creation failed, return fallback
  return fallback || null;
};

/**
 * Gets the first image from an array of images
 * @param images - Array of image paths
 * @param fallback - Local fallback image
 * @returns Image source object
 */
export const getFirstImageSource = (images?: string[] | null, fallback?: any) => {
  if (images && images.length > 0) {
    return getImageSource(images[0], fallback);
  }
  
  return fallback || null;
};

/**
 * Preloads images for faster display
 * @param imageUrls - Array of image URLs to preload
 */
export const preloadImages = async (imageUrls: string[]) => {
  try {
    const FastImage = require('react-native-fast-image').default;
    const validUrls = imageUrls.filter(url => url && typeof url === 'string');
    
    if (validUrls.length > 0) {
      const sources = validUrls.map(uri => ({ uri }));
      await FastImage.preload(sources);
    }
  } catch (error) {
    // Silently fail if FastImage is not available
  }
};

export default {
  getImageUrl,
  getImageSource,
  getFirstImageSource,
  preloadImages,
};
