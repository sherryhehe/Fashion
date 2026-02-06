import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, ShimmerLoader } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import { useOrder, useCancelOrder } from '../../hooks/useOrders';
import { getFirstImageSource } from '../../utils/imageHelper';
import { getColorCode, formatCurrency } from '../../utils/colorHelper';
import { useQueryClient } from '@tanstack/react-query';

type OrderDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

interface OrderDetailScreenProps {
  navigation: OrderDetailScreenNavigationProp;
  route: OrderDetailRouteProp;
}

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ navigation }) => {
  const route = useRoute<OrderDetailRouteProp>();
  const queryClient = useQueryClient();
  const orderId = route.params?.orderId || '';
  
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: orderData, isLoading, error, refetch } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();
  
  const order = orderData?.data as any;
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        refetch(),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [orderId, queryClient, refetch]);

  const handleCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      // Navigate back after successful cancellation
      navigation.goBack();
    } catch (error) {
      console.log('Error cancelling order:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'placed':
        return (
          <View style={[styles.statusIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Image source={icons.placed} style={styles.statusIcon} />
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.statusIconContainer, { backgroundColor: '#FFEBEE' }]}>
            <Image source={icons.cancelled} style={styles.statusIcon} />
          </View>
        );
      case 'delivered':
        return (
          <View style={[styles.statusIconContainer, { backgroundColor: '#E8F5E8' }]}>
            <Image source={icons.delivered} style={styles.statusIcon} />
          </View>
        );
      case 'processing':
      case 'shipped':
        return (
          <View style={[styles.statusIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Image source={icons.placed} style={styles.statusIcon} />
          </View>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Pending';
      case 'placed':
        return 'Order Placed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'cancelled':
        return 'Order Cancelled';
      case 'delivered':
        return 'Order Delivered';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}, ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  if (isLoading) {
    return (
      <SafeView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.orderCard}>
            <ShimmerLoader width="100%" height={200} borderRadius={12} style={styles.marginBottom} />
            <ShimmerLoader width="80%" height={20} borderRadius={4} style={styles.marginBottom} />
            <ShimmerLoader width="60%" height={16} borderRadius={4} />
          </View>
        </ScrollView>
      </SafeView>
    );
  }

  if (error || !order) {
    return (
      <SafeView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.emptyState}>
            <Image source={icons.search} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Order Not Found</Text>
            <Text style={styles.emptySubtext}>
              Unable to load order details. Please try again.
            </Text>
          </View>
        </ScrollView>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Order Status Card */}
        <View style={styles.orderCard}>
          <View style={styles.statusSection}>
            {getStatusIcon(order.status)}
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
              <Text style={styles.orderNumber}>Order #{order.orderNumber || order._id?.slice(-8)}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.orderCard}>
          <Text style={styles.sectionTitle}>Order Items ({order.items?.length || 0})</Text>
          {order.items?.map((item: any, index: number) => {
            const productImage = getFirstImageSource(
              item.productImage ? [item.productImage] : [],
              images.image1
            );

            return (
              <View key={index} style={styles.orderItem}>
                <Image source={productImage} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.productName || 'Product'}</Text>
                  <View style={styles.productAttributes}>
                    {item.color && (
                      <View style={styles.colorContainer}>
                        <Text style={styles.attributeLabel}>Color</Text>
                        <View style={[styles.colorSwatch, { backgroundColor: getColorCode(item.color) }]} />
                      </View>
                    )}
                    {item.size && (
                      <Text style={styles.sizeText}>Size: {item.size}</Text>
                    )}
                  </View>
                  <View style={styles.productRow}>
                    <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(item.total || item.price * item.quantity)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.orderCard}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </Text>
              <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </Text>
              <Text style={styles.addressText}>Phone: {order.shippingAddress.phone}</Text>
              {order.shippingAddress.email && (
                <Text style={styles.addressText}>Email: {order.shippingAddress.email}</Text>
              )}
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.orderCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal || 0)}</Text>
          </View>
          {order.shippingCost !== undefined && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.shippingCost)}</Text>
            </View>
          )}
          {order.tax !== undefined && order.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total || 0)}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.orderCard}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>{order.paymentMethod || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status</Text>
            <Text style={[styles.summaryValue, { 
              color: order.paymentStatus === 'paid' ? '#34C759' : 
                     order.paymentStatus === 'failed' ? '#FF3B30' : '#FF9500'
            }]}>
              {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
            </Text>
          </View>
        </View>

        {/* Cancel Order Button */}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              cancelOrderMutation.isPending && styles.cancelButtonDisabled
            ]}
            onPress={handleCancelOrder}
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#2C2C2E',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  productAttributes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  attributeLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  sizeText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productQuantity: {
    fontSize: 14,
    color: '#8E8E93',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  addressContainer: {
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#2C2C2E',
    marginBottom: 4,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2C2C2E',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    tintColor: '#8E8E93',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  marginBottom: {
    marginBottom: 12,
  },
});

export default OrderDetailScreen;

