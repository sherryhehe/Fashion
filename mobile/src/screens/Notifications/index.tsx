import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';

type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}

interface NotificationItem {
  id: string;
  type: 'order' | 'discount' | 'offer';
  brand?: string;
  title: string;
  message: string;
  time: string;
  icon: any;
  isRead: boolean;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ 
  navigation,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    // Today's notifications
    {
      id: '1',
      type: 'order',
      title: 'Order Shipment',
      message: 'Your order Makeup has been shipped and will arrive soon.',
      time: '10:04 AM',
      icon: icons.orders,
      isRead: false,
    },
    {
      id: '2',
      type: 'discount',
      brand: 'Khaddi',
      title: 'Special Discount',
      message: 'Get 20% off on your next purchase Khaddi. Limited time only!',
      time: '10:04 AM',
      icon: images.shopLogo,
      isRead: false,
    },
    {
      id: '3',
      type: 'offer',
      brand: 'Ideas',
      title: 'Buy 1 Get 1 Free',
      message: 'Buy 1 Get 1 Free offer is live! Don\'t miss out sale on Ideas.',
      time: '10:04 AM',
      icon: icons.verify,
      isRead: false,
    },
    {
      id: '4',
      type: 'offer',
      brand: 'Sapphire',
      title: 'Buy 1 Get 1 Free',
      message: 'Buy 1 Get 1 Free offer is live! Don\'t miss out sale on Sapphire.',
      time: '10:04 AM',
      icon: icons.verify,
      isRead: false,
    },
    // Yesterday's notifications
    {
      id: '5',
      type: 'order',
      title: 'Order Shipment',
      message: 'Your order Makeup has been shipped and will arrive soon.',
      time: '10:04 AM',
      icon: icons.orders,
      isRead: true,
    },
    {
      id: '6',
      type: 'discount',
      brand: 'Khaddi',
      title: 'Special Discount',
      message: 'Get 20% off on your next purchase Khaddi. Limited time only!',
      time: '10:04 AM',
      icon: images.shopLogo,
      isRead: true,
    },
    {
      id: '7',
      type: 'discount',
      brand: 'Khaddi',
      title: 'Special Discount',
      message: 'Get 20% off on your next purchase Khaddi. Limited time only!',
      time: '10:04 AM',
      icon: images.shopLogo,
      isRead: true,
    },
  ]);

  const todayNotifications = notifications.filter(notification => !notification.isRead);
  const yesterdayNotifications = notifications.filter(notification => notification.isRead);

  const handleMarkAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleNotificationPress = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const renderNotificationIcon = (notification: NotificationItem) => {
    if (notification.type === 'order') {
      return (
        <View style={styles.orderIconContainer}>
          <Image source={notification.icon} style={styles.orderIcon} />
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.brandIconContainer}>
        <Image source={notification.icon} style={styles.brandIcon} />
      </View>
    );
  };

  const renderNotificationCard = (notification: NotificationItem) => (
    <TouchableOpacity
      key={notification.id}
      style={styles.notificationCard}
      onPress={() => handleNotificationPress(notification.id)}
    >
      {renderNotificationIcon(notification)}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderNotificationSection = (title: string, notificationList: NotificationItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {notificationList.map(renderNotificationCard)}
    </View>
  );

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        </View>
        <TouchableOpacity onPress={handleMarkAsRead}>
          <Text style={styles.markAsReadButton}>Mark as Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Today's Notifications */}
        {todayNotifications.length > 0 && renderNotificationSection('Today', todayNotifications)}

        {/* Yesterday's Notifications */}
        {yesterdayNotifications.length > 0 && renderNotificationSection('Yesterday', yesterdayNotifications)}
      </ScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  markAsReadButton: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 16,
  },

  // Notification Card Styles
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  // Icon Styles
  orderIconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderIcon: {
    width: 24,
    height: 24,
    tintColor: '#2C2C2E',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  brandIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
  },

  // Content Styles
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#2C2C2E',
    lineHeight: 22,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default NotificationsScreen;
