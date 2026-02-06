import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import HomeNavigator from './HomeNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import StoreDetailScreen from '../screens/StoreDetailScreen';
import NotificationsScreen from '../screens/Notifications';
import OrdersScreen from '../screens/Orders';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import WishListScreen from '../screens/WishList';
import SearchScreen from '../screens/SearchScreen';
import CategoryListScreen,{ ListItem, ListItemType } from '../screens/CetegoryListScreen';


export type RootStackParamList = {
  Auth: { setIsAuthenticated: (isAuthenticated: boolean) => void };
  Home: undefined;
  ProductDetail: { productId?: string };
  StoreDetail: { storeId?: string };
  Notifications: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  WishList: undefined;
  Search: { autoFocus?: boolean, searchText?: string, headerText?: string, initialCategory?: string, initialStyle?: string };
  CategoryList: {
    title?: string;
    data?: ListItem[];
    listType?: ListItemType;
    numColumns?: number;
    showSearch?: boolean;
    showBackButton?: boolean;
    headerText?: string;
    searchPlaceholder?: string;
  };
};

interface MainNavigatorProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  onLogout?: () => void;
}

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator: React.FC<MainNavigatorProps> = ({ 
  isAuthenticated, 
  setIsAuthenticated, 
  onLogout 
}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={(props: any) => <HomeNavigator {...props} onLogout={onLogout} />}
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="StoreDetail" 
              component={StoreDetailScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Orders" 
              component={OrdersScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="OrderDetail" 
              component={OrderDetailScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="WishList" 
              component={WishListScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
              initialParams={{ autoFocus: true }}
            />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />

          </>
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={(props: any) => <AuthNavigator {...props} setIsAuthenticated={setIsAuthenticated} />}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
