import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, LoadingScreen } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import styles from './styles';

// API Hooks
import { useWishlist, useRemoveFromWishlist } from '../../hooks/useWishlist';
import { useAddToCart } from '../../hooks/useCart';
import { getFirstImageSource } from '../../utils/imageHelper';

const { width: screenWidth } = Dimensions.get('window');

// Helper function to extract colors from variations
const getColorsFromVariations = (variations: any[] = []) => {
  if (!variations || variations.length === 0) return [];
  
  const uniqueColors = new Map<string, { name: string; color: string }>();
  const colorMap: { [key: string]: string } = {
    'red': '#FF6B35',
    'orange': '#FF6B35',
    'blue': '#007AFF',
    'grey': '#8E8E93',
    'gray': '#8E8E93',
    'black': '#000000',
    'white': '#FFFFFF',
    'green': '#34C759',
    'yellow': '#FFCC00',
    'pink': '#FF2D92',
    'purple': '#AF52DE',
    'brown': '#A2845E',
    'maroon': '#800000',
    'navy': '#000080',
  };

  variations.forEach((variation) => {
    if (variation.color && !uniqueColors.has(variation.color)) {
      const colorName = variation.color.toLowerCase();
      const colorCode = colorMap[colorName] || '#8E8E93';
      uniqueColors.set(variation.color, {
        name: variation.color,
        color: colorCode,
      });
    }
  });

  return Array.from(uniqueColors.values());
};

// Helper function to extract sizes from variations
const getSizesFromVariations = (variations: any[] = []) => {
  if (!variations || variations.length === 0) {
    return [];
  }
  
  const uniqueSizes = new Set<string>();
  variations.forEach((variation) => {
    if (variation.size) {
      uniqueSizes.add(variation.size);
    }
  });

  return Array.from(uniqueSizes);
};

type WishListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WishList'>;

interface WishListScreenProps {
  navigation: WishListScreenNavigationProp;
}

const WishListScreen: React.FC<WishListScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [addingToCartProductId, setAddingToCartProductId] = useState<string | null>(null);

  // Fetch wishlist data from API (backend already includes products)
  const { data: wishlistData, isLoading: wishlistLoading } = useWishlist();

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useRemoveFromWishlist();
  
  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromWishlistMutation.mutateAsync(productId);
    } catch (error) {
      console.log('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (item: any) => {
    try {
      // Set the product ID that's being added
      setAddingToCartProductId(item.productId);
      
      // Use saved color/size from wishlist, or fallback to first available
      const sizeToUse = item.savedSize || item.firstSize || item.availableSizes?.[0] || undefined;
      const colorToUse = item.savedColor || item.firstColor || item.availableColors?.[0]?.name || undefined;
      
      // Add to cart directly with saved size/color from wishlist
      await addToCartMutation.mutateAsync({
        productId: item.productId,
        quantity: 1,
        size: sizeToUse,
        color: colorToUse,
      });
    } catch (error: any) {
      console.log('Error adding to cart:', error);
      // If error is 401, user needs to login - but don't navigate, just show error
      if (error?.status === 401 || error?.message?.includes('No token') || error?.message?.includes('Unauthorized')) {
        // Toast will be shown by the mutation's onError handler
      }
    } finally {
      // Clear the adding state
      setAddingToCartProductId(null);
    }
  };

  // Format wishlist items with product data from wishlist response
  // Backend already populates products in the wishlist response
  const wishlistItems = wishlistData?.data
    ?.filter((item: any) => item.product) // Only include items with valid products
    ?.map((item: any) => {
      const product = item.product;
      const variations = product.variations || [];
      
      // Get all available colors and sizes from variations
      const availableColors = getColorsFromVariations(variations);
      const availableSizes = getSizesFromVariations(variations);
      
      // Use saved color/size from wishlist item, or fallback to first available
      const savedColor = item.color || null;
      const savedSize = item.size || null;
      
      // Find saved color in available colors
      const selectedColorObj = savedColor 
        ? availableColors.find((c: any) => c.name === savedColor) || availableColors[0]
        : (availableColors.length > 0 ? availableColors[0] : null);
      
      // Use saved size or first available
      const selectedSize = savedSize || (availableSizes.length > 0 ? availableSizes[0] : null);
      
      return {
        id: product._id || item.productId,
        productId: item.productId || product._id, // Keep productId for navigation and remove operation
        name: product.name || 'Unknown Product',
        price: `PKR ${product.price?.toLocaleString() || '0'}`,
        availableColors,
        availableSizes,
        savedColor: savedColor, // Saved color from wishlist
        savedSize: savedSize, // Saved size from wishlist
        firstColor: selectedColorObj?.name || null,
        firstColorCode: selectedColorObj?.color || '#8E8E93',
        firstSize: selectedSize || null,
        hasMultipleColors: availableColors.length > 1,
        hasMultipleSizes: availableSizes.length > 1,
        quantity: 1,
        image: getFirstImageSource(product.images || [], images.homesliderimage),
      };
    }) || [];

  const isLoading = wishlistLoading;

  // Show loading screen while fetching data
  if (isLoading) {
    return <LoadingScreen message="Loading wishlist..." variant="full" />;
  }

  const renderWishlistItem = ({ item }: { item: any }) => {
    // Format color display text - show saved color if available
    const colorText = item.savedColor 
      ? item.savedColor
      : (item.hasMultipleColors 
        ? `${item.firstColor || 'Multiple'} (${item.availableColors.length})`
        : (item.firstColor || 'N/A'));
    
    // Format size display text - show saved size if available
    const sizeText = item.savedSize
      ? item.savedSize
      : (item.hasMultipleSizes
        ? `${item.firstSize || 'Multiple'} (${item.availableSizes.length})`
        : (item.firstSize || 'N/A'));
    
    return (
      <TouchableOpacity style={styles.wishlistItem} onPress={() => navigation.navigate('ProductDetail', { productId: item.productId })}>
        <Image source={item.image} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          {(item.savedColor || item.savedSize || item.firstColor || item.firstSize) ? (
            <View style={styles.productAttributes}>
              {(item.savedColor || item.firstColor) ? (
                <>
                  <View style={styles.attributeItem}>
                    <View style={[styles.colorDot, { backgroundColor: item.firstColorCode }]} />
                    <Text style={styles.attributeText}>
                      {item.savedColor ? `Color: ${item.savedColor}` : colorText}
                    </Text>
                  </View>
                  {(item.savedSize || item.firstSize) ? <View style={styles.separator} /> : null}
                </>
              ) : null}
              {(item.savedSize || item.firstSize) ? (
                <Text style={styles.attributeText}>
                  {item.savedSize ? `Size: ${item.savedSize}` : `Size = ${sizeText}`}
                </Text>
              ) : null}
            </View>
          ) : null}
          <Text style={styles.productPrice}>{item.price}</Text>
          

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                removeFromWishlistMutation.isPending && styles.deleteButtonDisabled
              ]}
              onPress={() => handleRemoveItem(item.productId)}
              disabled={removeFromWishlistMutation.isPending}
            >
              {removeFromWishlistMutation.isPending ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Image source={icons.delete} style={styles.deleteIcon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                addingToCartProductId === item.productId && styles.addToCartButtonDisabled
              ]}
              onPress={() => handleAddToCart(item)}
              disabled={addingToCartProductId === item.productId}
            >
              {addingToCartProductId === item.productId ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.addToCartText}>Add to cart</Text>
                  <Image source={icons.cart} style={styles.cartIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={icons.search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>
      </View>

      {/* Wishlist Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.wishlistContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Image source={icons.favorite} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              {searchText ? 'No items match your search' : 'Add items you love to see them here'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
};

export default WishListScreen;
