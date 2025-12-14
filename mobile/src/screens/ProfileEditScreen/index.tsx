import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeView, Avatar } from '../../components';
import InputField from '../../components/SimpleInputField';
import Button from '../../components/SimpleButton';
import LoadingScreen from '../../components/LoadingScreen';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import { useUpdateProfile } from '../../hooks/useAuth';
import authService from '../../services/auth.service';
import { showToast } from '../../utils/toast';
import { styles } from './styles';

interface ProfileEditScreenProps {
  navigation: any;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        setName(response.data.name || '');
        setEmail(response.data.email || '');
        setPhone(response.data.phone || '');
      }
    } catch (error: any) {
      console.log('Could not fetch profile, using stored data');
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setName(storedUser.name || '');
        setEmail(storedUser.email || '');
        setPhone(storedUser.phone || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast.error('Please enter your name');
      return;
    }

    try {
      console.log('💾 Updating profile...');
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
      });

      console.log('✅ Profile updated successfully!');
      showToast.success('Your profile has been updated!', 'Profile Updated');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.log('❌ Profile update failed:', error?.message || 'Unknown error');
      showToast.error(
        error?.message || 'Failed to update profile. Please try again.',
        'Update Failed'
      );
    }
  };

  if (loading) {
    return (
      <SafeView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={icons.backArrow} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerRight} />
        </View>
        <LoadingScreen message="Loading profile..." variant="compact" />
      </SafeView>
    );
  }

  return (
    <SafeView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Avatar
            name={user?.name || 'Guest User'}
            avatar={user?.avatar}
            size={120}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <InputField
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            style={styles.disabledInput}
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>

          <InputField
            label="Phone"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <Button
            title={updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            disabled={updateProfileMutation.isPending}
          />

          {updateProfileMutation.isPending && (
            <LoadingScreen variant="button" />
          )}
        </View>

        {/* Change Password Link */}
        <TouchableOpacity
          style={styles.changePasswordLink}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeView>
  );
};

export default ProfileEditScreen;

