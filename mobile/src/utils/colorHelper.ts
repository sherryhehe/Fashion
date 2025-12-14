/**
 * Color Helper Utilities
 * Provides consistent color mapping across the app
 */

/**
 * Color name to hex code mapping
 * Used for displaying product colors consistently
 */
const COLOR_MAP: { [key: string]: string } = {
  'red': '#FF6B35',
  'orange': '#FF6B35',
  'blue': '#007AFF',
  'grey': '#8E8E93',
  'gray': '#8E8E93',
  'black': '#000000',
  'white': '#FFFFFF',
  'green': '#4CAF50',
  'yellow': '#FFCC00',
  'pink': '#FF2D92',
  'purple': '#AF52DE',
  'brown': '#A2845E',
  'beige': '#F5F5DC',
  'navy': '#001F3F',
  'maroon': '#800000',
  'teal': '#008080',
  'cyan': '#00FFFF',
  'lime': '#32CD32',
  'magenta': '#FF00FF',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
};

/**
 * Get hex color code from color name
 * @param colorName - Color name (e.g., "Green", "green", "BLACK")
 * @param fallback - Fallback color if not found (default: '#8E8E93')
 * @returns Hex color code
 */
export const getColorCode = (colorName?: string | null, fallback: string = '#8E8E93'): string => {
  if (!colorName) return fallback;
  
  const normalizedName = colorName.toLowerCase().trim();
  return COLOR_MAP[normalizedName] || fallback;
};

/**
 * Check if a color is dark (for text color contrast)
 * @param hexColor - Hex color code
 * @returns true if color is dark, false if light
 */
export const isDarkColor = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance < 0.5;
};

/**
 * Get all available colors from the color map
 * @returns Array of color names
 */
export const getAvailableColors = (): string[] => {
  return Object.keys(COLOR_MAP);
};

/**
 * Format currency consistently across the app
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: 'PKR')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, currency: string = 'PKR'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${currency} 0`;
  
  return `${currency} ${numAmount.toLocaleString()}`;
};

export default {
  getColorCode,
  isDarkColor,
  getAvailableColors,
  formatCurrency,
};

