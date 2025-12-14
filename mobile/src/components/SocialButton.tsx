import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { icons } from '../assets/icons';

interface SocialButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  size = 'medium',
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

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 48;
      case 'medium':
        return 56;
      case 'large':
        return 64;
      default:
        return 56;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.socialButton,
        {
          width: getButtonSize(),
          height: getButtonSize(),
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={getIcon()}
        style={[
          styles.socialIcon,
          {
            width: getIconSize(),
            height: getIconSize(),
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    // Size will be set dynamically
  },
});

export default SocialButton;
