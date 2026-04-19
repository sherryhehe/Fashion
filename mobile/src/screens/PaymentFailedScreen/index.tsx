import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../../navigation/HomeNavigator';
import { SafeView } from '../../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type PaymentFailedParams = { orderId?: string; message?: string };

type NavProp = StackNavigationProp<CartStackParamList, 'PaymentFailed'>;
type RouteProps = RouteProp<CartStackParamList, 'PaymentFailed'>;

const PaymentFailedScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId;
  const message =
    route.params?.message ||
    'Your card payment could not be completed. No charge was finalized for this attempt.';

  const goToCart = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Cart' }],
      })
    );
  };

  return (
    <SafeView>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(24, insets.bottom + 16) },
        ]}
      >
        <View style={styles.iconWrap}>
          <View style={styles.failCircle}>
            <Text style={styles.failMark}>✕</Text>
          </View>
        </View>
        <Text style={styles.title}>Payment failed</Text>
        <Text style={styles.body}>{message}</Text>
        {orderId ? (
          <Text style={styles.meta}>Reference: #{String(orderId).slice(-8)}</Text>
        ) : null}

        <TouchableOpacity style={styles.primary} onPress={goToCart} activeOpacity={0.85}>
          <Text style={styles.primaryText}>Go to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondary}
          onPress={() => navigation.getParent()?.navigate('HomeStack')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryText}>Continue shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  iconWrap: { alignItems: 'center', marginBottom: 20 },
  failCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failMark: { fontSize: 36, color: '#FFFFFF', fontWeight: 'bold' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2E',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    color: '#AEAEB2',
    textAlign: 'center',
    marginBottom: 28,
  },
  primary: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  secondary: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  secondaryText: { color: '#2C2C2E', fontSize: 17, fontWeight: '600' },
});

export default PaymentFailedScreen;
