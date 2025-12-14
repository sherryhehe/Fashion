import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { icons } from '../assets/icons';

interface SimpleSocialButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onPress: () => void;
  style?: ViewStyle;
}

const SimpleSocialButton: React.FC<SimpleSocialButtonProps> = ({
  provider,
  onPress,
  style,
}) => {
  const getIcon = () => {
    switch (provider) {
      case 'google':
        return icons.google;
      case 'facebook':
        return icons.facebook;
      case 'apple':
        return icons.apple;
      default:
        return icons.google;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.socialButton, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={getIcon()}
        style={styles.socialIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    width: 100,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default SimpleSocialButton;
