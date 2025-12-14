import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeView } from '../../components';
import InputField from '../../components/SimpleInputField';
import Button from '../../components/SimpleButton';
import LoadingScreen from '../../components/LoadingScreen';
import { icons } from '../../assets/icons';
import { useChangePassword } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';
import { styles } from './styles';

interface ChangePasswordScreenProps {
  navigation: any;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useChangePassword();

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword.trim()) {
      showToast.error('Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      showToast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      showToast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      showToast.error('New password must be different from current password');
      return;
    }

    try {
      console.log('🔒 Attempting to change password...');
      console.log('Current password length:', currentPassword.trim().length);
      console.log('New password length:', newPassword.trim().length);
      
      const response = await changePasswordMutation.mutateAsync({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      console.log('✅ Password changed successfully!');
      console.log('Response:', response);
      
      showToast.success('Your password has been updated successfully!', 'Password Changed');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.log('❌ Password change failed:', error?.message || 'Unknown error');
      
      showToast.error(
        error?.message || 'Failed to change password. Please check your current password and try again.',
        'Password Change Failed'
      );
    }
  };

  return (
    <SafeView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.description}>
          Please enter your current password and choose a new password.
        </Text>

        {/* Current Password */}
        <InputField
          label="Current Password"
          icon="password"
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrentPassword}
          showPasswordToggle
          isPasswordVisible={showCurrentPassword}
          onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
        />

        {/* New Password */}
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

        {/* Confirm New Password */}
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

        {/* Password Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirementText}>• At least 6 characters long</Text>
          <Text style={styles.requirementText}>• Different from current password</Text>
        </View>

        {/* Change Password Button */}
        <Button
          title={changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
          onPress={handleChangePassword}
          variant="primary"
          disabled={changePasswordMutation.isPending}
          style={styles.button}
        />

        {changePasswordMutation.isPending && (
          <LoadingScreen variant="button" />
        )}
      </ScrollView>
    </SafeView>
  );
};

export default ChangePasswordScreen;

