import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  SafeAreaView,
} from 'react-native';
import { styles } from './styles';

interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
  showLogo?: boolean;
  variant?: 'full' | 'compact' | 'button';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  showSpinner = true,
  showLogo = false,
  variant = 'full',
}) => {
  // Simple animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade in
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Simple spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Compact variant for inline loading
  if (variant === 'compact') {
    return (
      <Animated.View style={[styles.compactContainer, { opacity: fadeValue }]}>
        {showSpinner && (
          <Animated.View style={[styles.compactSpinner, { transform: [{ rotate: spin }] }]} />
        )}
        <Text style={styles.compactMessage}>{message}</Text>
      </Animated.View>
    );
  }

  // Button overlay variant
  if (variant === 'button') {
    return (
      <View style={styles.buttonOverlay}>
        <Animated.View style={[styles.buttonSpinner, { transform: [{ rotate: spin }] }]} />
      </View>
    );
  }

  // Full screen variant (default)
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeValue }]}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Shop </Text>
          </View>
        )}
        
        {showSpinner && (
          <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]} />
        )}
        
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LoadingScreen;
