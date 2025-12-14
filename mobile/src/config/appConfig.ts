/**
 * App Configuration
 * Centralized configuration for app-wide constants
 */

/**
 * Delivery and Shipping Configuration
 * These values can be later moved to backend API or remote config
 */
export const DELIVERY_CONFIG = {
  // Default delivery fee (in PKR)
  DEFAULT_DELIVERY_FEE: 100,
  
  // Default shipping cost (in PKR)
  DEFAULT_SHIPPING_COST: 200,
  
  // Tax rate (as decimal, e.g., 0.05 = 5%)
  DEFAULT_TAX_RATE: 0.05, // 5%
  
  // Free delivery threshold (in PKR) - delivery is free above this amount
  FREE_DELIVERY_THRESHOLD: 5000,
};

/**
 * Get delivery fee based on subtotal
 * Can be extended to support dynamic pricing
 */
export const getDeliveryFee = (subtotal: number = 0): number => {
  // Free delivery if subtotal exceeds threshold
  if (subtotal >= DELIVERY_CONFIG.FREE_DELIVERY_THRESHOLD) {
    return 0;
  }
  return DELIVERY_CONFIG.DEFAULT_DELIVERY_FEE;
};

/**
 * Get shipping cost
 * Can be extended to support different shipping methods
 */
export const getShippingCost = (): number => {
  return DELIVERY_CONFIG.DEFAULT_SHIPPING_COST;
};

/**
 * Get tax amount based on subtotal
 */
export const getTaxAmount = (subtotal: number): number => {
  return subtotal * DELIVERY_CONFIG.DEFAULT_TAX_RATE;
};

export default DELIVERY_CONFIG;

