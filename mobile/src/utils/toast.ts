/**
 * Toast Notification Utility
 * Wrapper around react-native-toast-message for consistent styling
 */

import Toast from 'react-native-toast-message';

export const showToast = {
  /**
   * Show success toast
   */
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, title?: string) => {
    Toast.show({
      type: 'info', // react-native-toast-message doesn't have warning by default
      text1: title || 'Warning',
      text2: message,
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Hide all toasts
   */
  hide: () => {
    Toast.hide();
  },
};

export default showToast;

