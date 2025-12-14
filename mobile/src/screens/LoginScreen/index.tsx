import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthScrollView from '../../components/AuthScrollView';
import InputField from '../../components/SimpleInputField';
import Button from '../../components/SimpleButton';
import LoadingScreen from '../../components/LoadingScreen';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useLogin } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import authService from '../../services/auth.service';
import { styles } from './styles';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  route: {
    params: {
      setIsAuthenticated: (isAuthenticated: boolean) => void;
    };
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const { setIsAuthenticated } = route?.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Use TanStack Query mutation for login
  const loginMutation = useLogin();

  const handleLogin = async () => {
    // Validate inputs
    if (!email.trim()) {
      showToast.error('Please enter your email');
      return;
    }

    if (!password.trim()) {
      showToast.error('Please enter your password');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error('Please enter a valid email address');
      return;
    }

    try {
      // Call login API
      console.log('🔐 Attempting login with email:', email.trim().toLowerCase());
      const response = await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // Success - navigate to main app
      console.log('✅ Login successful!');
      showToast.success('Welcome back!', 'Login Successful');
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      // Error handling
      console.log('❌ Login failed:', error?.message || 'Unknown error');
      showToast.error(
        error?.message || 'Invalid email or password. Please try again.',
        'Login Failed'
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleContinueAsGuest = async () => {
    try {
      console.log('👤 Enabling guest mode...');
      // Enable guest mode
      await authService.enableGuestMode();
      console.log('✅ Guest mode enabled!');
      showToast.success('Welcome! Continue browsing as a guest', 'Guest Mode');
      
      // Navigate to main app as guest
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('❌ Error enabling guest mode:', error);
      showToast.error('Unable to continue as guest. Please try again.');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  // Show loading screen if login is in progress
  if (loginMutation.isPending) {
    return <LoadingScreen message="Logging you in..." variant="full" />;
  }

  return (
    <AuthScrollView>
      <Text style={styles.title}>Welcome Back!</Text>

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

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <Button
        title="Login"
        onPress={handleLogin}
        variant="primary"
        style={styles.loginButton}
        disabled={loginMutation.isPending}
      />

      {/* OR Separator */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>OR</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Continue as Guest Button */}
      <Button
        title="Continue as Guest"
        onPress={handleContinueAsGuest}
        variant="outline"
        style={styles.guestButton}
      />

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpLink}>Signup</Text>
        </TouchableOpacity>
      </View>
    </AuthScrollView>
  );
};

export default LoginScreen;
