/**
 * Guest Mode Helper
 * Utilities to check guest mode and prompt login
 */

import { Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import authService from '../services/auth.service';
import { navigateToAuth } from '../../App';

/**
 * Check if user is a guest and prompt to login if needed
 * @param featureName - Name of the feature (e.g., "add to cart", "wishlist", "checkout")
 * @param navigation - Navigation object to navigate to Auth screen
 * @param onCancel - Callback when user cancels (optional)
 * @returns Promise<boolean> - true if user is not a guest, false if guest
 */
export const requireAuthOrPromptLogin = async (
  featureName: string = 'this feature',
  navigation?: NavigationProp<any> | null,
  onCancel?: () => void
): Promise<boolean> => {
  try {
    const isGuest = await authService.isGuest();
    const hasToken = !!(await authService.getToken());

    // If user has a token, they're authenticated
    if (hasToken && !isGuest) {
      return true;
    }

    // User is a guest, show login prompt
    Alert.alert(
      'Login Required',
      `Please login to ${featureName}. You can continue browsing as a guest, but you'll need to login to use this feature.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (onCancel) {
              onCancel();
            }
          },
        },
        {
          text: 'Login',
          style: 'default',
          onPress: async () => {
            try {
              // Use the global navigateToAuth function which will:
              // 1. Logout and clear guest mode
              // 2. Set isAuthenticated to false in App.tsx
              // 3. MainNavigator will automatically show Auth screen
              await navigateToAuth();
            } catch (error) {
              console.log('Navigation error:', error);
            }
          },
        },
      ]
    );

    return false;
  } catch (error) {
    console.log('Error checking guest mode:', error);
    return false;
  }
};

/**
 * Check if user is a guest (without prompting)
 * @returns Promise<boolean> - true if user is a guest
 */
export const isGuestUser = async (): Promise<boolean> => {
  try {
    return await authService.isGuest();
  } catch (error) {
    console.log('Error checking guest mode:', error);
    return false;
  }
};

/**
 * Check if user is authenticated (has valid token)
 * @returns Promise<boolean> - true if user is authenticated
 */
export const isAuthenticatedUser = async (): Promise<boolean> => {
  try {
    const token = await authService.getToken();
    const isGuest = await authService.isGuest();
    return !!token && !isGuest;
  } catch (error) {
    console.log('Error checking authentication:', error);
    return false;
  }
};

