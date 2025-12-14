import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { icons } from '../assets/icons';

const { width } = Dimensions.get('window');

const FloatingBottomTab: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const tabs = [
    {
      name: 'HomeStack',
      icon: icons.bottomHome,
      activeIcon: icons.bottomHomeFilled,
    },
    {
      name: 'Explore',
      icon: icons.bottomExplore,
      activeIcon: icons.bottomExploreFilled,
    },
    {
      name: 'CartStack',
      icon: icons.bottomCart,
      activeIcon: icons.bottomCartFilled,
    },
    {
      name: 'SettingsStack',
      icon: icons.bottomSetting,
      activeIcon: icons.bottomSettingFilled,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Image
                  source={isActive ? tab.activeIcon : tab.icon}
                  style={[styles.icon, isActive && styles.activeIcon]}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    width: 42,
    height: 42,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#8E8E93',
  },
  activeIcon: {
    width: 24,
    height: 24,
    tintColor: '#2C2C2E',
  },
});

export default FloatingBottomTab;
