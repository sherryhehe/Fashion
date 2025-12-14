import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface SimpleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

const SimpleButton: React.FC<SimpleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
}) => {
  const getButtonStyle = () => {
    if (variant === 'outline') {
      return [styles.button, styles.outlineButton];
    }
    return [styles.button, styles.primaryButton];
  };

  const getTextStyle = () => {
    if (variant === 'outline') {
      return [styles.buttonText, styles.outlineText];
    }
    return [styles.buttonText, styles.primaryText];
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1A1A1A',
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#1A1A1A',
  },
});

export default SimpleButton;
