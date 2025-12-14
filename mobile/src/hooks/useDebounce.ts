import { useEffect, useState } from 'react';

/**
 * Returns a debounced value that only updates after the specified delay.
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds before updating the debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

