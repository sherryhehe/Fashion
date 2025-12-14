import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { icons } from '../assets/icons';

interface SimpleInputFieldProps extends TextInputProps {
  label: string;
  icon?: 'email' | 'password';
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
}

const SimpleInputField: React.FC<SimpleInputFieldProps> = ({
  label,
  icon,
  style,
  showPasswordToggle = false,
  onTogglePassword,
  isPasswordVisible = false,
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
      <View style={styles.inputContainer}>
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
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIconContainer}
            onPress={onTogglePassword}
            activeOpacity={0.7}
          >
            <Image
              source={isPasswordVisible ? icons.hide : icons.show}
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        )}
      </View>
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
  eyeIconContainer: {
    padding: 4,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#666666',
  },
});

export default SimpleInputField;
