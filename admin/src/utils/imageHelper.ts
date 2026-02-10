/**
 * Image Helper Utilities for Admin Panel
 * Converts backend image paths to full URLs
 */

// Get the base URL for images (API URL without /api)
const getApiBaseUrl = (): string => {
  // First, try to get from dedicated image base URL environment variable
  if (process.env.NEXT_PUBLIC_IMAGE_BASE_URL) {
    return process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  }
  
  // Then, try to get from API URL environment variable
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // If not set, detect production environment
  if (!apiUrl) {
    // Check if we're in browser and can detect hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      
      // Check for production domain
      if (hostname === 'admin.buyshopo.com' || hostname.includes('buyshopo.com')) {
        // Use admin.buyshopo.com for both API and images
        apiUrl = 'https://admin.buyshopo.com/api';
      } else if (process.env.NODE_ENV === 'production') {
        // Fallback for production builds without hostname detection
        apiUrl = 'https://admin.buyshopo.com/api';
      } else {
        // Development - use current origin or localhost
        apiUrl = `${protocol}//${hostname}:8000/api`;
      }
    } else {
      // Server-side rendering
      if (process.env.NODE_ENV === 'production') {
        apiUrl = 'https://admin.buyshopo.com/api';
      } else {
        apiUrl = 'http://localhost:8000/api';
      }
    }
  }
  
  // Remove /api from the end if present to get base URL for static files
  // The backend serves /uploads at the root, not under /api
  let baseUrl = apiUrl;
  if (apiUrl.endsWith('/api')) {
    baseUrl = apiUrl.replace(/\/api$/, '');
  }
  
  // Ensure no trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  return baseUrl;
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
  // Try /api/uploads/ first (works with reverse proxies), fallback to /uploads/
  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = getApiBaseUrl();
    // Ensure imagePath starts with / (it should already)
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Try API route first (works better with reverse proxies)
    // Convert /uploads/image.png to /api/uploads/image.png
    const apiPath = cleanPath.replace(/^\/uploads\//, '/api/uploads/');
    const fullUrl = `${baseUrl}${apiPath}`;
    
    // Debug logging (always log to help diagnose production issues)
    if (typeof window !== 'undefined') {
      console.log('🖼️ Image URL Construction:');
      console.log('  Image Path:', imagePath);
      console.log('  Base URL:', baseUrl);
      console.log('  API Path:', apiPath);
      console.log('  Full URL:', fullUrl);
    }
    
    return fullUrl;
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

