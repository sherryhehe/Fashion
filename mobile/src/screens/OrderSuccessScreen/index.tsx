import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../../navigation/HomeNavigator';
import { SafeView } from '../../components';
import { useOrder } from '../../hooks/useOrders';

export type OrderSuccessScreenParams = { orderId: string };

type OrderSuccessNavigationProp = StackNavigationProp<CartStackParamList, 'OrderSuccess'>;

interface OrderSuccessScreenProps {
  navigation: OrderSuccessNavigationProp;
  route: { params: OrderSuccessScreenParams };
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId || '';
  const { data: orderResponse, isLoading } = useOrder(orderId);
  const order = orderResponse?.data;

  const formatPrice = (n: number) => `PKR ${(n || 0).toLocaleString()}`;

  return (
    <SafeView>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(100, insets.bottom + 24) },
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>
        <Text style={styles.title}>Order Successful!</Text>
        <Text style={styles.subtitle}>
          Thank you for shopping with us. You'll receive updates about your delivery shortly.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#34C759" style={styles.loader} />
        ) : order ? (
          <>
            <View style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <Text style={styles.orderLabel}>Order Number</Text>
                <Text style={styles.orderNumber}>#{order.orderNumber || order._id?.slice(-6)}</Text>
                <Text style={styles.orderMeta}>
                  {order.items?.length || 0} Items · {formatPrice(order.total)}
                </Text>
              </View>
              {order.items?.length > 0 && (
                <View style={styles.itemsList}>
                  {order.items.slice(0, 5).map((item: any, idx: number) => (
                    <View key={`${item.productId}-${idx}`} style={styles.itemRow}>
                      <View style={styles.itemImagePlaceholder} />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                        <Text style={styles.itemMeta}>
                          Qty: {item.quantity} · {formatPrice(item.total)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.deliveryBar}>
                <Text style={styles.deliveryLabel}>Expected Delivery</Text>
                <Text style={styles.deliveryValue}>2-4 Business Days</Text>
              </View>
            </View>
          </>
        ) : null}

        <Text style={styles.emailNote}>A confirmation email has been sent to your inbox.</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            const tabNav = navigation.getParent();
            if (tabNav) tabNav.navigate('HomeStack');
          }}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            const rootNav = navigation.getParent()?.getParent();
            if (rootNav) rootNav.navigate('Orders');
          }}
        >
          <Text style={styles.secondaryButtonText}>View Order Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  loader: {
    marginVertical: 24,
  },
  orderCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderCardHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  orderMeta: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 'auto',
  },
  itemsList: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E5E7',
    marginRight: 12,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, color: '#2C2C2E', fontWeight: '500' },
  itemMeta: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  deliveryBar: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderRadius: 8,
    padding: 12,
  },
  deliveryLabel: { fontSize: 13, color: '#8E8E93' },
  deliveryValue: { fontSize: 16, fontWeight: '600', color: '#34C759', marginTop: 2 },
  emailNote: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  secondaryButtonText: {
    color: '#2C2C2E',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default OrderSuccessScreen;
