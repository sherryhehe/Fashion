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
import { useForgotPassword } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import { styles } from './styles';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      showToast.error('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      showToast.error('Please enter a valid email address');
      return;
    }

    try {
      // Check if email exists and get reset token
      const response = await forgotPasswordMutation.mutateAsync(email);
      console.log('Reset password response:', response);
      
      if (response.success && response.data && response.data.resetToken) {
        showToast.success('Email verified. Please set your new password.');
        // Navigate directly to reset password screen with token
        navigation.navigate('ResetPassword', { 
          email: email.trim(),
          resetToken: response.data.resetToken 
        });
      } else {
        showToast.error('Email not found. Please check your email address.');
      }
    } catch (error: any) {
      console.log('Forgot password error:', error?.message || 'Unknown error');
      showToast.error(error?.message || 'Failed to verify email');
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <AuthScrollView>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Don't worry! It happens. Please enter your email address to verify and reset your password.
      </Text>

      {/* Email Input */}
      <InputField
        label="Email"
        icon="email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Verify Email Button */}
      <Button
        title={forgotPasswordMutation.isPending ? "Verifying..." : "Verify Email"}
        onPress={handleSendResetLink}
        variant="primary"
        style={styles.sendButton}
        disabled={forgotPasswordMutation.isPending}
      />
      
      {forgotPasswordMutation.isPending && (
        <LoadingScreen variant="compact" message="Verifying email..." />
      )}

      {/* Back to Login Link */}
      <View style={styles.backToLoginContainer}>
        <Text style={styles.backToLoginText}>Remember your password? </Text>
        <TouchableOpacity onPress={handleBackToLogin}>
          <Text style={styles.backToLoginLink}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </AuthScrollView>
  );
};

export default ForgotPasswordScreen;
