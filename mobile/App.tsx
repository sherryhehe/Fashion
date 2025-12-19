/**
 * Fashion App
 * Main App with Authentication and Main Navigation
 *
 * @format
 */

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import MainNavigator from './src/navigation/MainNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from './src/lib/queryClient';
import Toast from 'react-native-toast-message';
import authService from './src/services/auth.service';

// Global function to handle logout and show auth screen
// This will be set by App component
let globalSetIsAuthenticated: ((value: boolean) => void) | null = null;

export const setGlobalAuthHandler = (handler: (value: boolean) => void) => {
  globalSetIsAuthenticated = handler;
};

export const navigateToAuth = async () => {
  // Clear guest mode and logout
  await authService.logout();
  
  // Trigger App to show Auth screen by setting isAuthenticated to false
  if (globalSetIsAuthenticated) {
    globalSetIsAuthenticated(false);
  }
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  // Authentication state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for stored authentication on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('App: Checking stored authentication...');
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          const token = await authService.getToken();
          const user = await authService.getStoredUser();
          console.log('App: Found stored authentication');
          console.log('App: Token exists:', !!token);
          console.log('App: User:', user?.name);
          setIsAuthenticated(true);
        } else {
          console.log('App: No stored authentication found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('App: Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSetAuthenticated = (authenticated: boolean) => {
    console.log('App: Setting authentication state:', authenticated);
    console.log('App: Current isAuthenticated state:', isAuthenticated);
    setIsAuthenticated(authenticated);
  };

  // Set up global auth handler so guestHelper can trigger auth screen
  useEffect(() => {
    setGlobalAuthHandler(handleSetAuthenticated);
    return () => {
      setGlobalAuthHandler(() => {});
    };
  }, []);

  const handleLogout = async () => {
    console.log('App: Logging out user');
    await authService.logout();
    setIsAuthenticated(false);
  };

  console.log('App: Current authentication state:', isAuthenticated);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
            backgroundColor="#FFFFFF"
          />
          <MainNavigator 
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={handleSetAuthenticated}
            onLogout={handleLogout}
          />
          <Toast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export default App;
