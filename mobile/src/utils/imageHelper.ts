/**
 * Image Helper Utilities
 * Converts backend image paths to full URLs with caching support
 */

import { Image } from 'react-native';

// Import centralized API configuration
import { IMAGE_BASE_URL } from '../config/apiConfig';

/**
 * Converts a backend image path to a full URL
 * @param imagePath - Image path from backend (e.g., "/uploads/image.jpg")
 * @returns Full URL or null if invalid
 */
export const getImageUrl = (imagePath?: string | null): string | null => {
  if (!imagePath) return null;
  const trimmedPath = imagePath.trim();
  if (!trimmedPath) return null;

  // Guard against common invalid string values coming from APIs/DB.
  const invalidPathLiterals = new Set(['null', 'undefined', 'n/a', 'na', 'none']);
  if (invalidPathLiterals.has(trimmedPath.toLowerCase())) {
    return null;
  }
  
  // If it's already a full URL, check if it needs domain replacement
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    // Replace old domain with new domain if present
    const updatedUrl = trimmedPath.replace(/https?:\/\/api\.buyshopo\.com/g, IMAGE_BASE_URL);
    return encodeURI(updatedUrl);
  }
  
  // Ensure imagePath starts with / for proper URL construction
  let normalizedPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
  
  // If the path starts with /uploads/, convert it to /api/uploads/ (matches backend routing)
  if (normalizedPath.startsWith('/uploads/')) {
    normalizedPath = normalizedPath.replace(/^\/uploads\//, '/api/uploads/');
  }

  // Handle spaces/special chars in filenames and folders.
  normalizedPath = encodeURI(normalizedPath);
  
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
    // Some products contain broken first image entries ("null", empty, etc).
    // Pick the first valid-looking image instead of hardcoding index 0.
    for (const imagePath of images) {
      if (!imagePath || typeof imagePath !== 'string') continue;
      const source = getImageSource(imagePath);
      if (source) return source;
    }
  }
  
  return fallback || null;
};

/**
 * Preloads images for faster display.
 * Uses React Native's built-in Image.prefetch (Fresco on Android, NSURLCache on iOS).
 * @param imageUrls - Array of image URLs to preload
 */
export const preloadImages = async (imageUrls: string[]) => {
  try {
    const validUrls = imageUrls.filter(url => url && typeof url === 'string');
    if (validUrls.length === 0) return;
    await Promise.all(validUrls.map(uri => Image.prefetch(uri)));
  } catch (error) {
    // Silently fail — prefetching is best-effort.
  }
};

export default {
  getImageUrl,
  getImageSource,
  getFirstImageSource,
  preloadImages,
};
