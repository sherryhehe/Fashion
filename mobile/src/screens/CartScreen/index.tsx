import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../../navigation/HomeNavigator';
import { SafeView, Button, ShimmerLoader } from '../../components';
import images from '../../assets/images';
import { styles } from './styles';
import { icons } from '../../assets/icons';
import { getFirstImageSource } from '../../utils/imageHelper';

// Platform fee: 200 PKR on every order (matches backend)
const PLATFORM_FEE = 200;

// API Hooks
import { useCart, useUpdateCartItem, useRemoveFromCart } from '../../hooks/useCart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: any;
  productId: string;
}

type CartScreenNavigationProp = StackNavigationProp<CartStackParamList, 'Cart'>;

interface CartScreenProps {
  navigation: CartScreenNavigationProp;
}

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const [promoCode, setPromoCode] = useState('');

  // Fetch cart from API (only runs if authenticated)
  const { data: cartData, isLoading: cartLoading, error: cartError } = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  // Get cart items with product details
  // Backend returns cart items with a `product` field containing full product details
  // If user is not authenticated, cartData will be undefined and cartItems will be empty
  const rawCartItems = cartData?.data || [];
  
  // Map cart items to include product details from the API
  // Memoize to prevent recalculation on every render
  const cartItems = useMemo(() => {
    if (!rawCartItems || rawCartItems.length === 0) return [];
    
    return rawCartItems.map((item: any) => {
      const product = item.product || null;
      
      // Get price from product object only (cart items don't store price)
      // Ensure price is a valid positive number
      const productPrice = product && 
                          product.price && 
                          typeof product.price === 'number' && 
                          product.price > 0 
        ? product.price 
        : 0;
      
      return {
        ...item,
        id: item._id || item.id,
        productId: item.productId,
        productName: product?.name || item.productName || 'Unknown Product',
        productPrice: productPrice,
        productImage: product?.images?.[0] || item.productImage,
        price: productPrice,
        name: product?.name || item.productName || 'Unknown Product',
        images: product?.images || (item.productImage ? [item.productImage] : []),
        hasValidProduct: !!product && 
                        !!product.price && 
                        typeof product.price === 'number' && 
                        product.price > 0,
      };
    });
  }, [rawCartItems]);
  
  // Check if error is due to not being authenticated (expected case)
  const isUnauthenticated = cartError?.status === 401 && cartError?.data?.error === 'No token provided';

  // Calculate totals using product prices from API
  // Memoize to prevent recalculation on every render
  // Only include items with valid product data and prices
  const { subtotal, deliveryFee, total } = useMemo(() => {
    // Filter items that have valid prices and quantities > 0
    const validItems = cartItems.filter((item: any) => {
      return item.hasValidProduct && 
             item.quantity > 0 && 
             item.productPrice > 0;
    });
    
    // Calculate subtotal from valid items only
    const calculatedSubtotal = validItems.reduce((sum: number, item: any) => {
      const price = item.productPrice || 0;
      const quantity = item.quantity || 0;
      if (price > 0 && quantity > 0) {
        return sum + (price * quantity);
      }
      return sum;
    }, 0);
    
    // Platform fee: 200 PKR on every order (matches backend)
    // Calculate total
    const calculatedTotal = calculatedSubtotal + PLATFORM_FEE;
    
    return {
      subtotal: calculatedSubtotal,
      deliveryFee: PLATFORM_FEE,
      total: calculatedTotal,
    };
  }, [cartItems]);

  const updateQuantity = async (cartItemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    
    if (newQuantity === 0) {
      // Remove item if quantity becomes 0
      try {
        await removeFromCartMutation.mutateAsync(cartItemId);
      } catch (error) {
        console.log('Error removing item:', error);
      }
    } else {
      // Update quantity
      try {
        await updateCartItemMutation.mutateAsync({
          cartItemId,
          data: { quantity: newQuantity },
        });
      } catch (error) {
        console.log('Error updating quantity:', error);
      }
    }
  };

  // Show shimmer loader while fetching cart
  if (cartLoading) {
    return (
      <SafeView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.cartItem}>
              <ShimmerLoader width={100} height={120} borderRadius={8} />
              <View style={styles.itemDetails}>
                <ShimmerLoader width="80%" height={16} borderRadius={4} style={styles.marginBottom} />
                <ShimmerLoader width="60%" height={12} borderRadius={4} style={styles.marginBottom} />
                <ShimmerLoader width="40%" height={16} borderRadius={4} />
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeView>
    );
  }

  const renderCartItem = (item: any) => {
    // Use product details from API (backend returns product data in item.product)
    const productName = item.productName || item.name || 'Unknown Product';
    const productPrice = item.productPrice || item.price || 0;
    // Handle image from API - could be a full URL or just a path
    const productImage = item.productImage || (item.images && item.images[0]);
    const imageSource = productImage 
      ? (productImage.startsWith('http') 
          ? { uri: productImage } 
          : getFirstImageSource([productImage], images.image1))
      : images.image1;

    return (
      <TouchableOpacity 
        key={item._id || item.id} 
        style={styles.cartItem}
        onPress={() => navigation.getParent()?.navigate('ProductDetail', { productId: item.productId })}
        activeOpacity={0.7}
      >
        <Image source={imageSource} style={styles.productImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{productName}</Text>
          <View style={styles.itemSpecs}>
            {item.color && (
              <>
                <View style={[styles.colorSwatch, { backgroundColor: item.color.toLowerCase() === 'green' ? '#4CAF50' : '#000' }]} />
                <Text style={styles.itemSpecsText}>Color</Text>
              </>
            )}
            {item.size && (
              <>
                {item.color && <Text style={styles.itemSpecsText}> | </Text>}
                <Text style={styles.itemSpecsText}>Size = {item.size}</Text>
              </>
            )}
          </View>
          <View style={styles.priceAndQuantityRow}>
            <Text style={styles.itemPrice}>Rs.{productPrice.toLocaleString()}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonActive]}
                onPress={() => updateQuantity(item._id || item.id, item.quantity, 1)}
                disabled={updateCartItemMutation.isPending}
              >
                <Text style={[styles.quantityButtonText, styles.quantityButtonTextActive]}>+</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item._id || item.id, item.quantity, -1)}
                disabled={updateCartItemMutation.isPending}
              >
                <Text style={styles.quantityButtonText}>–</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Pressable 
          style={[
            styles.deleteIconContainer,
            removeFromCartMutation.isPending && styles.deleteIconContainerDisabled
          ]}
          onPress={() => removeFromCartMutation.mutate(item._id || item.id)}
          disabled={removeFromCartMutation.isPending}
        >
          {removeFromCartMutation.isPending ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <Image source={icons.delete} style={styles.deleteIcon} />
          )}
        </Pressable>
      </TouchableOpacity>
    );
  };

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <>
            <View style={styles.cartItemsContainer}>
              {cartItems.filter((item: any) => item.quantity > 0).map(renderCartItem)}
            </View>
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>Add items to your cart to continue shopping</Text>
          </View>
        )}

        {/* Combined Promo Code and Order Summary Section - Only show if cart has items */}
        {cartItems.length > 0 && (
          <View style={styles.combinedSection}>
            {/* Promo Code Section */}
            <View style={styles.promoSection}>
              <View style={styles.promoContainer}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Promo Code"
                  placeholderTextColor="#999999"
                  value={promoCode}
                  onChangeText={setPromoCode}
                />
                <TouchableOpacity style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sub-total</Text>
                <Text style={styles.summaryValue}>{subtotal.toLocaleString()} PKR</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform Fee</Text>
                <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} PKR</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalValue}>{total.toLocaleString()} PKR</Text>
              </View>
            </View>
          </View>
        )}
        {cartItems.filter((item: any) => item.quantity === 0).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Not in Cart</Text>
            <View style={styles.cartItemsContainer}>
              {cartItems.filter((item: any) => item.quantity === 0).map(renderCartItem)}
            </View>
          </>
        )}

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <View style={styles.checkoutContainer}>
            <Button
              title="Proceed To Checkout"
              onPress={() => navigation.navigate('Checkout')}
              variant="primary"
              size="large"
              style={styles.checkoutButton}
              disabled={cartItems.filter((item: any) => item.quantity > 0).length === 0}
            />
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
};

// Styles moved to separate file

export default CartScreen;
