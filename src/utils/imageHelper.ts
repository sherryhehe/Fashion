/**
 * Image Helper Utilities for Admin Panel
 * Converts backend image paths to full URLs
 */

// Get the base URL for images (API URL without /api)
const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  // Remove /api from the end if present
  if (apiUrl.endsWith('/api')) {
    return apiUrl.replace(/\/api$/, '');
  }
  
  // If it doesn't end with /api, assume it's already the base URL
  return apiUrl;
};

/**
 * Converts a backend image path to a full URL
 * @param imagePath - Image path from backend (e.g., "/uploads/image.jpg")
 * @param fallback - Fallback image path if imagePath is invalid
 * @returns Full URL or fallback image
 */
export const getImageUrl = (
  imagePath?: string | null,
  fallback: string = '/assets/images/products/product-1.png'
): string => {
  // If no image path provided, return fallback
  if (!imagePath || imagePath.trim() === '') {
    return fallback;
  }
  
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /uploads/, prepend API base URL
  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${imagePath}`;
  }
  
  // If it doesn't start with /, add it
  if (!imagePath.startsWith('/')) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/uploads/${imagePath}`;
  }
  
  // Unknown format, return fallback
  return fallback;
};

/**
 * Gets image URL for product images array
 * @param images - Array of image paths
 * @param index - Index of image to get (default: 0)
 * @param fallback - Fallback image path
 * @returns Full URL or fallback
 */
export const getProductImageUrl = (
  images?: string[] | null,
  index: number = 0,
  fallback: string = '/assets/images/products/product-1.png'
): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback;
  }
  
  const imagePath = images[index];
  return getImageUrl(imagePath, fallback);
};

/**
 * Gets brand logo URL
 * @param logoPath - Logo path from backend
 * @param fallback - Fallback image path
 * @returns Full URL or fallback
 */
export const getBrandLogoUrl = (
  logoPath?: string | null,
  fallback: string = '/assets/images/products/product-1.png'
): string => {
  return getImageUrl(logoPath, fallback);
};

/**
 * Gets brand banner URL
 * @param bannerPath - Banner path from backend
 * @returns Full URL or null if no banner
 */
export const getBrandBannerUrl = (
  bannerPath?: string | null
): string | null => {
  if (!bannerPath || bannerPath.trim() === '' || bannerPath === 'null') {
    return null;
  }
  
  return getImageUrl(bannerPath, '') || null;
};

/**
 * Gets category image URL
 * @param imagePath - Category image path from backend
 * @param fallback - Fallback image path
 * @returns Full URL or fallback
 */
export const getCategoryImageUrl = (
  imagePath?: string | null,
  fallback: string = '/assets/images/products/product-1.png'
): string => {
  return getImageUrl(imagePath, fallback);
};

/**
 * Gets style image URL
 * @param imagePath - Style image path from backend
 * @param fallback - Fallback image path
 * @returns Full URL or fallback
 */
export const getStyleImageUrl = (
  imagePath?: string | null,
  fallback: string = '/assets/images/products/product-1.png'
): string => {
  return getImageUrl(imagePath, fallback);
};

