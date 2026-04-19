import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import { CartStackParamList } from '../../navigation/HomeNavigator';
import { SafeView } from '../../components';
import { useOrder, useConfirmOrderPayment } from '../../hooks/useOrders';
import type { Order } from '../../services/order.service';
import { MERCHANT_DISPLAY_NAME } from '../../config/stripe';
import { showToast } from '../../utils/toast';
import { getFirstImageSource } from '../../utils/imageHelper';
import images from '../../assets/images';

export type OrderSuccessScreenParams = { orderId: string; clientSecret?: string };

type OrderSuccessNavigationProp = StackNavigationProp<CartStackParamList, 'OrderSuccess'>;

interface OrderSuccessScreenProps {
  navigation: OrderSuccessNavigationProp;
  route: { params: OrderSuccessScreenParams };
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId || '';
  const clientSecret = route.params?.clientSecret;
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { data: orderResponse, isLoading, refetch } = useOrder(orderId);
  const order: Order | undefined = (() => {
    const d = orderResponse?.data;
    if (d == null) return undefined;
    return Array.isArray(d) ? d[0] : d;
  })();
  const confirmPaymentMutation = useConfirmOrderPayment();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const needsPayment = !!clientSecret && !paymentComplete && order?.paymentStatus !== 'paid';

  const handlePayNow = async () => {
    if (!clientSecret || !orderId) return;
    try {
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: MERCHANT_DISPLAY_NAME,
      });
      if (initError) {
        showToast.error(initError.message || 'Could not load payment form');
        navigation.replace('PaymentFailed', {
          orderId,
          message: initError.message || 'Could not load payment form',
        });
        return;
      }
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        showToast.error(presentError.message || 'Payment was cancelled');
        navigation.replace('PaymentFailed', {
          orderId,
          message: presentError.message || 'Payment did not complete',
        });
        return;
      }
      await confirmPaymentMutation.mutateAsync(orderId);
      setPaymentComplete(true);
      refetch();
      showToast.success('Payment successful!', 'Order confirmed');
    } catch (err: any) {
      showToast.error(err?.message || 'Payment failed');
      navigation.replace('PaymentFailed', {
        orderId,
        message: err?.message || 'Payment failed',
      });
    }
  };

  const formatPrice = (n: number) => `PKR ${(n || 0).toLocaleString()}`;
  const title = needsPayment ? 'Order created — pay to confirm' : 'Order successful!';
  const subtitle = needsPayment
    ? 'Pay with your card below to confirm this order.'
    : "Thank you for shopping with us. You'll receive updates about your delivery shortly.";

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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {isLoading && (
          <ActivityIndicator size="large" color="#34C759" style={styles.loader} />
        )}
        {!isLoading && order && (
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
                {order.items.slice(0, 20).map((item: any, idx: number) => {
                  const imgSrc = item.productImage
                    ? getFirstImageSource([item.productImage], images.image1)
                    : images.image1;
                  return (
                    <View key={`${item.productId}-${idx}`} style={styles.itemRow}>
                      <Image source={imgSrc} style={styles.itemThumb} resizeMode="cover" />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                        <Text style={styles.itemMeta}>
                          Qty: {item.quantity} · {formatPrice(item.total)}
                        </Text>
                        {(item.size || item.color) ? (
                          <Text style={styles.itemMeta}>
                            {[item.color, item.size ? `Size ${item.size}` : ''].filter(Boolean).join(' · ')}
                          </Text>
                        ) : null}
                        {item.shippingFee > 0 ? (
                          <Text style={styles.itemShipping}>Shipping: {formatPrice(item.shippingFee)}</Text>
                        ) : null}
                        {item.shippingTime ? (
                          <Text style={styles.itemNote}>Est. delivery: {item.shippingTime}</Text>
                        ) : null}
                        {item.notes ? (
                          <Text style={styles.itemNote} numberOfLines={4}>Note: {item.notes}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            <View style={styles.feeBox}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Item</Text>
                <Text style={styles.feeVal}>{formatPrice(order.subtotal)}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Shipping</Text>
                <Text style={styles.feeVal}>{formatPrice(order.shippingCost ?? 0)}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Platform fees</Text>
                <Text style={styles.feeVal}>{formatPrice(order.platformFee ?? 0)}</Text>
              </View>
              {(order.transactionFee ?? 0) > 0 ? (
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Card fee (5%)</Text>
                  <Text style={styles.feeVal}>{formatPrice(order.transactionFee ?? 0)}</Text>
                </View>
              ) : null}
              <View style={[styles.feeRow, styles.feeTotalRow]}>
                <Text style={styles.feeTotalLabel}>Total</Text>
                <Text style={styles.feeTotalVal}>{formatPrice(order.total)}</Text>
              </View>
            </View>
            <View style={styles.deliveryBar}>
              <Text style={styles.deliveryLabel}>Updates</Text>
              <Text style={styles.deliveryValue}>We'll send you a confirmation message.</Text>
            </View>
          </View>
        )}

        <Text style={styles.emailNote}>A confirmation email has been sent to your inbox.</Text>

        {needsPayment && (
          <TouchableOpacity
            style={styles.payNowButton}
            onPress={handlePayNow}
            disabled={confirmPaymentMutation.isPending}
          >
            {confirmPaymentMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Pay now</Text>
            )}
          </TouchableOpacity>
        )}

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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E5E7',
    marginRight: 12,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, color: '#2C2C2E', fontWeight: '500' },
  itemMeta: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  itemShipping: { fontSize: 12, color: '#2C2C2E', fontWeight: '600', marginTop: 4 },
  itemNote: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  feeBox: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feeLabel: { fontSize: 14, color: '#8E8E93' },
  feeVal: { fontSize: 14, color: '#2C2C2E', fontWeight: '500' },
  feeTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  feeTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#2C2C2E' },
  feeTotalVal: { fontSize: 16, fontWeight: 'bold', color: '#34C759' },
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
  payNowButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
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
