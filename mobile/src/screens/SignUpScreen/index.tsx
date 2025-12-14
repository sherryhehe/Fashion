import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import AuthScrollView from '../../components/AuthScrollView';
import InputField from '../../components/SimpleInputField';
import Button from '../../components/SimpleButton';
import LoadingScreen from '../../components/LoadingScreen';
import { useRegister } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import { styles } from './styles';

interface SignUpScreenProps {
  navigation: any;
  route?: {
    params?: {
      setIsAuthenticated?: (isAuthenticated: boolean) => void;
    };
  };
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation, route }) => {
  const { setIsAuthenticated } = route?.params || {};
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Use TanStack Query mutation for registration
  const registerMutation = useRegister();

  const handleSignUp = async () => {
    // Validate inputs
    if (!name.trim()) {
      showToast.error('Please enter your name');
      return;
    }

    if (!email.trim()) {
      showToast.error('Please enter your email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      showToast.error('Please enter a password');
      return;
    }

    if (password.length < 6) {
      showToast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    try {
      // Prepare registration data
      const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      };

      // Double-check validation
      if (!registrationData.name || !registrationData.email || !registrationData.password) {
        showToast.error('Please fill in all required fields');
        return;
      }

      // Call register API
      console.log('📝 Attempting registration with:', {
        name: registrationData.name,
        email: registrationData.email,
        passwordLength: registrationData.password.length,
      });

      const response = await registerMutation.mutateAsync(registrationData);

      // Success
      console.log('✅ Registration successful!', response);
      showToast.success('Your account has been created successfully!', 'Welcome!');
      
      // Navigate after a short delay to let user see the success message
      setTimeout(() => {
        if (setIsAuthenticated) {
          setIsAuthenticated(true);
        } else {
          navigation.navigate('Login');
        }
      }, 1000);
    } catch (error: any) {
      // Error handling with better messages
      console.log('❌ Registration failed:', error);
      
      let errorMessage = 'Unable to create account. Please try again.';
      
      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (errorMessage.toLowerCase().includes('required')) {
        errorMessage = 'Please fill in all required fields.';
      } else if (errorMessage.toLowerCase().includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      }

      showToast.error(errorMessage, 'Registration Failed');
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  // Show loading screen if registration is in progress
  if (registerMutation.isPending) {
    return <LoadingScreen message="Creating your account..." variant="full" />;
  }

  return (
    <AuthScrollView>
      <Text style={styles.title}>Create your Account</Text>

      {/* Name Input */}
      <InputField
        label="Name"
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      {/* Email Input */}
      <InputField
        label="Email"
        icon="email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <InputField
        label="Password"
        icon="password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        showPasswordToggle
        isPasswordVisible={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />

      {/* Confirm Password Input */}
      <InputField
        label="Confirm Password"
        icon="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        showPasswordToggle
        isPasswordVisible={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {/* Sign Up Button */}
      <Button
        title="Sign UP"
        onPress={handleSignUp}
        variant="primary"
        style={styles.signUpButton}
        disabled={registerMutation.isPending}
      />

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Have a account? </Text>
        <TouchableOpacity onPress={handleSignIn}>
          <Text style={styles.signInLink}>Signin</Text>
        </TouchableOpacity>
      </View>
    </AuthScrollView>
  );
};

export default SignUpScreen;
