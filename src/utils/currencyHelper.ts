/**
 * Currency Helper Utilities
 * Formats prices in PKR (Pakistani Rupees)
 */

/**
 * Formats a number as PKR currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "PKR 1,234.56" or "Rs 1,234.56"
 */
export const formatCurrency = (amount: number | string | null | undefined, decimals: number = 2): string => {
  if (amount === null || amount === undefined || amount === '') {
    return 'PKR 0.00';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'PKR 0.00';
  }

  return `PKR ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

/**
 * Formats a number as PKR currency with short format (Rs)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "Rs 1,234.56"
 */
export const formatCurrencyShort = (amount: number | string | null | undefined, decimals: number = 2): string => {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rs 0.00';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Rs 0.00';
  }

  return `Rs ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

/**
 * Formats a number as PKR currency without decimals
 * @param amount - The amount to format
 * @returns Formatted string like "PKR 1,234"
 */
export const formatCurrencyNoDecimals = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') {
    return 'PKR 0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'PKR 0';
  }

  return `PKR ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

