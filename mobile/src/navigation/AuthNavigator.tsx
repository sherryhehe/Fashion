import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen/index';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: { setIsAuthenticated: (isAuthenticated: boolean) => void };
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string; resetToken?: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC<{ setIsAuthenticated: (isAuthenticated: boolean) => void }> = ({ setIsAuthenticated }) => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
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
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        initialParams={{ setIsAuthenticated }} 
      />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
