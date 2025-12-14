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
import { useResetPassword } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import { styles } from './styles';

interface ResetPasswordScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      resetToken?: string;
    };
  };
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { email, resetToken } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const resetPasswordMutation = useResetPassword();

  const handleResetPassword = async () => {
    // Validate inputs
    if (!newPassword.trim()) {
      showToast.error('Please enter your new password');
      return;
    }

    if (!confirmPassword.trim()) {
      showToast.error('Please confirm your password');
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      showToast.error('Password must be at least 6 characters long');
      return;
    }

    if (!resetToken) {
      showToast.error('Invalid reset token. Please request a new reset link.');
      return;
    }

    try {
      console.log('🔄 Resetting password...');
      await resetPasswordMutation.mutateAsync({
        resetToken,
        newPassword: newPassword.trim(),
      });

      console.log('✅ Password reset successful!');
      showToast.success('Your password has been reset successfully!', 'Password Reset');
      
      // Navigate back to login after a short delay
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1000);
    } catch (error: any) {
      console.log('❌ Password reset failed:', error?.message || 'Unknown error');
      showToast.error(
        error?.message || 'Failed to reset password. Please try again.',
        'Reset Failed'
      );
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <AuthScrollView>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your new password for {email}
      </Text>

      {/* New Password Input */}
      <InputField
        label="New Password"
        icon="password"
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!showNewPassword}
        showPasswordToggle
        isPasswordVisible={showNewPassword}
        onTogglePassword={() => setShowNewPassword(!showNewPassword)}
      />

      {/* Confirm Password Input */}
      <InputField
        label="Confirm New Password"
        icon="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        showPasswordToggle
        isPasswordVisible={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {/* Reset Password Button */}
      <Button
        title={resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
        onPress={handleResetPassword}
        variant="primary"
        style={styles.resetButton}
        disabled={resetPasswordMutation.isPending}
      />
      
      {resetPasswordMutation.isPending && (
        <LoadingScreen variant="compact" message="Resetting password..." />
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

export default ResetPasswordScreen;
