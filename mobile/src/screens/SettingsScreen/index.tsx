import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, Avatar } from '../../components';
import LoadingScreen from '../../components/LoadingScreen';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import { styles } from './styles';
import { useUser, useLogout } from '../../hooks/useAuth';
import authService from '../../services/auth.service';
import { showToast } from '../../utils/toast';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
  onLogout?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation, onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Use logout mutation
  const logoutMutation = useLogout();

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      console.log('Could not fetch profile, using stored data');
      // Try to get stored user data
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('👋 Logging out...');
              await logoutMutation.mutateAsync();
              showToast.success('See you soon!', 'Logged Out');
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              console.log('❌ Logout failed');
              showToast.error('Failed to logout. Please try again.', 'Logout Failed');
            }
          },
        },
      ]
    );
  };

  const renderProfileSection = () => {
    if (loading) {
      return <LoadingScreen message="Loading profile..." variant="compact" />;
    }

    return (
      <View style={styles.profileCard}>
        <Avatar
          name={user?.name || 'Guest User'}
          avatar={user?.avatar}
          size={60}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => {
              navigation.navigate('ProfileEdit');
            }}
          >
            <Image source={icons.edit} style={styles.editIcon} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionItem = (
    icon: any,
    title: string,
    onPress: () => void,
    showArrow: boolean = true,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.sectionItem} onPress={onPress}>
      <View style={styles.sectionItemLeft}>
        <Image source={icon} style={styles.sectionItemIcon} />
        <Text style={styles.sectionItemText}>{title}</Text>
      </View>
      <View style={styles.sectionItemRight}>
        {rightComponent || (showArrow && (
          <Image source={icons.chevronRight} style={styles.arrowIcon} />
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
    
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          {renderProfileSection()}
        </View>

        {/* Removed non-functional Account Details section */}

        {/* App Section */}
        {renderSection('App', (
          <>
            {renderSectionItem(icons.favorite, 'Wishlist', () => navigation.getParent()?.navigate('WishList'))}
            <View style={styles.separator} />
            {renderSectionItem(icons.orders, 'Orders', () => navigation.getParent()?.navigate('Orders'))}
          </>
        ))}

        {/* General Section - Notifications tab removed (not set up yet per requirements) */}
        {/* Removed non-functional buttons: Choose Language, Privacy Policy, About App */}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <LoadingScreen variant="button" />
            ) : (
              <>
                <Image source={icons.logout} style={styles.logoutIcon} />
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeView>
  );
};

export default SettingsScreen;