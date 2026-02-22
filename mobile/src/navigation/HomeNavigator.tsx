import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CategoriesScreen from '../screens/Categories';
import CheckoutScreen from '../screens/Checkout';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import FloatingBottomTab from '../components/FloatingBottomTab';

// Define parameter lists for type safety
export type HomeStackParamList = {
  Home: undefined;
  Categories: undefined;

};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
};

export type HomeTabParamList = {
  HomeStack: undefined;
  Explore: undefined;
  CartStack: undefined;
  SettingsStack: undefined;
};

const HomeStack = createStackNavigator<HomeStackParamList>();
const CartStack = createStackNavigator<CartStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Categories" component={CategoriesScreen} />
    </HomeStack.Navigator>
  );
};

// Cart Stack Navigator
const CartStackNavigator = () => {
  return (
    <CartStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
      <CartStack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    </CartStack.Navigator>
  );
};

// Settings Stack Navigator
interface SettingsStackNavigatorProps {
  onLogout?: () => void;
}

const SettingsStackNavigator: React.FC<SettingsStackNavigatorProps> = ({ onLogout }) => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <SettingsStack.Screen 
        name="Settings" 
        component={(props: any) => <SettingsScreen {...props} onLogout={onLogout} />}
      />
    </SettingsStack.Navigator>
  );
};

// Main Tab Navigator
interface HomeNavigatorProps {
  onLogout?: () => void;
}

const HomeNavigator: React.FC<HomeNavigatorProps> = ({ onLogout }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen 
        name="CartStack" 
        component={CartStackNavigator}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen 
        name="SettingsStack" 
        component={(props: any) => <SettingsStackNavigator {...props} onLogout={onLogout} />}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default HomeNavigator;
