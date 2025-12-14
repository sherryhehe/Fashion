import React from 'react';
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
import { SafeView, ShimmerLoader } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';

// API Hooks
import { useOrders, useCancelOrder } from '../../hooks/useOrders';
import { getFirstImageSource } from '../../utils/imageHelper';
import { getColorCode, formatCurrency } from '../../utils/colorHelper';

type OrdersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Orders'>;

interface OrdersScreenProps {
  navigation: OrdersScreenNavigationProp;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ 
  navigation
}) => {
  // Fetch orders from API
  const { data: ordersData, isLoading: ordersLoading } = useOrders();
  const cancelOrderMutation = useCancelOrder();

  // Get orders array - ensure it's always an array
  const orders = Array.isArray(ordersData?.data) 
    ? ordersData.data 
    : (ordersData?.data ? [ordersData.data] : []);

  // Show shimmer loader while fetching orders
  if (ordersLoading) {
    return (
      <SafeView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <ShimmerLoader width={30} height={30} borderRadius={15} />
                <View style={styles.statusTextContainer}>
                  <ShimmerLoader width={120} height={16} borderRadius={4} style={styles.marginBottom} />
                  <ShimmerLoader width={100} height={12} borderRadius={4} />
                </View>
              </View>
              <View style={styles.lineSeparator} />
              <View style={styles.productSection}>
                <ShimmerLoader width={80} height={80} borderRadius={8} />
                <View style={styles.productDetails}>
                  <ShimmerLoader width="80%" height={16} borderRadius={4} style={styles.marginBottom} />
                  <ShimmerLoader width="60%" height={12} borderRadius={4} style={styles.marginBottom} />
                  <ShimmerLoader width="40%" height={16} borderRadius={4} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeView>
    );
  }

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
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
    } catch (error) {
      console.log('Error cancelling order:', error);
    }
  };

  const renderOrderItem = (order: any) => {
    // Get first item from order for display
    const firstItem = order.items?.[0] || {};
    // Use product image saved in order (for historical reference)
    // Fallback to default image if not available (for older orders created before this fix)
    const productImage = getFirstImageSource(
      firstItem.productImage ? [firstItem.productImage] : [],
      images.image1
    );

    return (
      <View key={order._id || order.id} style={styles.orderCard}>
        {/* Order Status Header */}
        <TouchableOpacity 
          style={styles.orderHeader}
          onPress={() => {
            // Navigate to order details if we have a dedicated screen
            // For now, just show order info - could navigate to a detail screen in future
            console.log('View order details:', order._id || order.id);
            // Future: navigation.getParent()?.navigate('OrderDetail', { orderId: order._id || order.id });
          }}
        >
          <View style={styles.statusSection}>
            {getStatusIcon(order.status)}
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>
        <View style={styles.lineSeparator} />

        {/* Product Details Section */}
        <View style={styles.productSection}>
          <Image source={productImage} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{firstItem.productName || ''}</Text>
            {order.items && order.items.length > 1 && (
              <Text style={styles.moreItemsText}>+{order.items.length - 1} more item(s)</Text>
            )}
            <View style={styles.productAttributes}>
              {firstItem.color && (
                <View style={styles.colorContainer}>
                  <Text style={styles.attributeLabel}>Color</Text>
                  <View style={[styles.colorSwatch, { backgroundColor: getColorCode(firstItem.color) }]} />
                </View>
              )}
              {firstItem.size && (
                <Text style={styles.sizeText}>Size = {firstItem.size}</Text>
              )}
            </View>
            <View style={styles.rowSpaced}>
              <Text style={styles.productPrice}>{formatCurrency(order.total || 0)}</Text>
             
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Orders List */}
        {orders.length > 0 ? (
          <View style={styles.ordersList}>
            {orders.map(renderOrderItem)}
          </View>
        ) : (
          <View style={styles.emptyOrdersContainer}>
            <Text style={styles.emptyOrdersText}>No orders yet</Text>
            <Text style={styles.emptyOrdersSubtext}>Your order history will appear here</Text>
          </View>
        )}
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

  // Orders List Styles
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Order Header Styles
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  lineSeparator: {
    height: 1,
    backgroundColor: '#E8ECF4',
    marginHorizontal: 16,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  cancelIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#8E8E93',
    fontWeight: 'bold',
  },

  // Product Section Styles
  productSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  rowSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
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
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  deleteIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  emptyOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyOrdersText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  marginBottom: {
    marginBottom: 8,
  },
});

export default OrdersScreen;
