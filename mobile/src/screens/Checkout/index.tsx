import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../../navigation/HomeNavigator';
import { SafeView, ShimmerLoader } from '../../components';
import { icons } from '../../assets/icons';

// API Hooks
import { useCart } from '../../hooks/useCart';
import { useCreateOrder } from '../../hooks/useOrders';
import authService from '../../services/auth.service';
import { showToast } from '../../utils/toast';
import { getShippingCost, getTaxAmount } from '../../config/appConfig';
import { requireAuthOrPromptLogin } from '../../utils/guestHelper';

type CheckoutScreenNavigationProp = StackNavigationProp<CartStackParamList, 'Checkout'>;

interface CheckoutScreenProps {
  navigation: CheckoutScreenNavigationProp;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ 
  navigation
}) => {
  const [email, setEmail] = useState('');
  const [newsletterChecked, setNewsletterChecked] = useState(false);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saveInfoChecked, setSaveInfoChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Fetch cart and user profile
  const { data: cartData, isLoading: cartLoading } = useCart();
  const createOrderMutation = useCreateOrder();

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setEmail(response.data.email || '');
          setFirstName(response.data.name?.split(' ')[0] || '');
          setLastName(response.data.name?.split(' ').slice(1).join(' ') || '');
          setPhoneNumber(response.data.phone || '');
        }
      } catch (error) {
        console.log('Error loading profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  const cartItems = cartData?.data || [];

  const handleSubmitOrder = async () => {
    // Check if user is guest and prompt login
    const isAuthenticated = await requireAuthOrPromptLogin(
      'complete checkout',
      async () => {
        // Clear guest mode and logout to force navigation to login
        await authService.logout();
        // Navigation will be handled by MainNavigator when isAuthenticated becomes false
      }
    );

    if (!isAuthenticated) {
      return; // User chose not to login
    }

    // Validate required fields
    if (!email.trim()) {
      showToast.error('Please enter your email');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      showToast.error('Please enter your full name');
      return;
    }

    if (!address.trim()) {
      showToast.error('Please enter your address');
      return;
    }

    if (!city.trim()) {
      showToast.error('Please select a city');
      return;
    }

    if (!country.trim()) {
      showToast.error('Please select a country');
      return;
    }

    if (!phoneNumber.trim()) {
      showToast.error('Please enter your phone number');
      return;
    }

    if (cartItems.length === 0) {
      showToast.error('Your cart is empty');
      return;
    }

    // Prepare order items from cart
    const orderItems = cartItems.map((item: any) => ({
      productId: item.productId,
      productName: item.productName || 'Unknown Product',
      quantity: item.quantity,
      price: item.price || 0,
      total: (item.price || 0) * item.quantity,
      size: item.size,
      color: item.color,
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.total, 0);
    const tax = getTaxAmount(subtotal);
    const shippingCost = getShippingCost();
    const total = subtotal + tax + shippingCost;

    // Prepare shipping address
    const shippingAddress = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phoneNumber.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
    };

    try {
      await createOrderMutation.mutateAsync({
        items: orderItems,
        shippingAddress,
        paymentMethod,
        notes: saveInfoChecked ? 'Save information for next time' : undefined,
      });

      // Navigate to orders screen after successful order
      navigation.getParent()?.navigate('Orders');
    } catch (error: any) {
      console.log('Error creating order:', error);
      // Error is already handled by the mutation hook
    }
  };

  const renderRadioButton = (isSelected: boolean) => (
    <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
      {isSelected && <View style={styles.radioButtonInner} />}
    </View>
  );

  // Show shimmer loader while fetching cart
  if (cartLoading) {
    return (
      <SafeView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Check Out</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <ShimmerLoader width="40%" height={20} borderRadius={4} style={styles.marginBottom} />
            <View style={styles.formWrapper}>
              <ShimmerLoader width="100%" height={50} borderRadius={16} style={styles.marginBottom} />
            </View>
          </View>
          <View style={styles.section}>
            <ShimmerLoader width="50%" height={20} borderRadius={4} style={styles.marginBottom} />
            <View style={styles.formWrapper}>
              {[1, 2, 3, 4, 5].map((item) => (
                <ShimmerLoader key={item} width="100%" height={50} borderRadius={16} style={styles.marginBottom} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeView>
    );
  }

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Out</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
         
         <View style={styles.formWrapper} >
         <TextInput style={[styles.input,styles.emailInputOverload]}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
            <Text style={styles.checkboxLabel}>Email me with news & offers</Text>
         </View>
        </View>

        {/* Shipping Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.formWrapper} >
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#8E8E93"
            value={city}
            onChangeText={setCity}
          />

          <TextInput
            style={styles.input}
            placeholder="Country"
            placeholderTextColor="#8E8E93"
            value={country}
            onChangeText={setCountry}
          />

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#8E8E93"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#8E8E93"
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#8E8E93"
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#8E8E93"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setSaveInfoChecked(!saveInfoChecked)}
          >
            <View style={[styles.checkbox, saveInfoChecked && styles.checkboxChecked]}>
              {saveInfoChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Save Information for next time</Text>
          </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={[styles.formWrapper,styles.paymentMethodWrapper]} >
          <TouchableOpacity 
            style={styles.paymentOption}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              {renderRadioButton(paymentMethod === 'card')}
              <Text style={styles.paymentOptionText}>Debit- Credit Card</Text>
            </View>
            <View style={styles.mastercardLogo}>
              <Text style={styles.mastercardText}>MC</Text>
            </View>
          </TouchableOpacity>
<View style={styles.lineSeparator} />
          <TouchableOpacity 
            style={styles.paymentOption}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.paymentOptionLeft}>
              {renderRadioButton(paymentMethod === 'cod')}
              <Text style={styles.paymentOptionText}>Cash on Delivery (COD)</Text>
            </View>
          </TouchableOpacity>
        </View>
        </View>

        {/* Submit Order Button */}
        <TouchableOpacity 
          style={[styles.submitButton, createOrderMutation.isPending && styles.submitButtonDisabled]} 
          onPress={handleSubmitOrder}
          disabled={createOrderMutation.isPending || cartItems.length === 0}
        >
          <Text style={styles.submitButtonText}>
            {createOrderMutation.isPending ? 'Placing order...' : 'Submit Order'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  formWrapper: {
    borderColor: '#E8ECF4',
    borderWidth: 1,borderRadius: 16,paddingHorizontal: 12,paddingVertical: 12,
  },
  paymentMethodWrapper:{
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  editButton: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 16,
  },

  // Input Styles
  input: {
    backgroundColor: '#FFFFFF',
borderWidth:1,
borderColor: '#E8ECF4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2C2C2E',
    marginBottom: 16,
  },
  emailInputOverload:{
    backgroundColor: '#F2F2F7',

  },

  // Dropdown Styles (now used as container for TextInput)
  dropdownInput: {
    marginBottom: 0,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownTextInput: {
    fontSize: 16,
    color: '#2C2C2E',
    flex: 1,
    padding: 0,
  },
  dropdownTextPlaceholder: {
    color: '#8E8E93',
  },
  dropdownTextSelected: {
    color: '#2C2C2E',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Checkbox Styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2C2C2E',
    borderColor: '#2C2C2E',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2C2C2E',
    flex: 1,
  },

  // Payment Method Styles
  paymentOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#2C2C2E',
    marginLeft: 12,
  },
  mastercardLogo: {
    width: 32,
    height: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mastercardText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lineSeparator:{
    height: 1,
    backgroundColor: '#E8ECF4',
  },

  // Radio Button Styles
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2C2C2E',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2C2C2E',
  },

  // Submit Button Styles
  submitButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  marginBottom: {
    marginBottom: 16,
  },
});

export default CheckoutScreen;
