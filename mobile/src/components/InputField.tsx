import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TextInputProps,
} from 'react-native';
import { icons } from '../assets/icons';

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: 'email' | 'password';
  error?: string;
  variant?: 'default' | 'outlined';
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  error,
  variant = 'default',
  style,
  ...props
}) => {
  const getIcon = () => {
    if (icon === 'email') return icons.email;
    if (icon === 'password') return icons.password;
    return null;
  };

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputContainer,
        variant === 'outlined' && styles.outlinedContainer,
        error && styles.errorContainer,
      ]}>
        {icon && (
          <View style={styles.inputIcon}>
            <Image source={getIcon()} style={styles.iconImage} />
          </View>
        )}
        <TextInput
          style={[styles.textInput, style]}
          placeholderTextColor="#999999"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    height: 56,
  },
  outlinedContainer: {
    borderColor: '#1A1A1A',
    borderWidth: 2,
  },
  errorContainer: {
    borderColor: '#FF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#666666',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
});

export default InputField;
