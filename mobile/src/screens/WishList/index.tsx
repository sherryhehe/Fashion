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

  // Fetch wishlist data from API (backend already includes products)
  const { data: wishlistData, isLoading: wishlistLoading } = useWishlist();

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useRemoveFromWishlist();

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

  const handleAddToCart = (productId: string) => {
    // Navigate to product detail screen where user can add to cart
    // This is the standard flow - user can select size/color on product detail
    navigation.navigate('ProductDetail', { productId });
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
      
      // Get first color and size for display, or show count if multiple
      const firstColor = availableColors.length > 0 ? availableColors[0] : null;
      const firstSize = availableSizes.length > 0 ? availableSizes[0] : null;
      
      return {
        id: product._id || item.productId,
        productId: item.productId || product._id, // Keep productId for navigation and remove operation
        name: product.name || 'Unknown Product',
        price: `PKR ${product.price?.toLocaleString() || '0'}`,
        availableColors,
        availableSizes,
        firstColor: firstColor?.name || null,
        firstColorCode: firstColor?.color || '#8E8E93',
        firstSize: firstSize || null,
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
    // Format color display text
    const colorText = item.hasMultipleColors 
      ? `${item.firstColor || 'Multiple'} (${item.availableColors.length})`
      : (item.firstColor || 'N/A');
    
    // Format size display text
    const sizeText = item.hasMultipleSizes
      ? `${item.firstSize || 'Multiple'} (${item.availableSizes.length})`
      : (item.firstSize || 'N/A');
    
    return (
      <View style={styles.wishlistItem}>
        <Image source={item.image} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          {(item.firstColor || item.firstSize) ? (
            <View style={styles.productAttributes}>
              {item.firstColor ? (
                <>
                  <View style={styles.attributeItem}>
                    <View style={[styles.colorDot, { backgroundColor: item.firstColorCode }]} />
                    <Text style={styles.attributeText}>{colorText}</Text>
                  </View>
                  {item.firstSize ? <View style={styles.separator} /> : null}
                </>
              ) : null}
              {item.firstSize ? (
                <Text style={styles.attributeText}>Size = {sizeText}</Text>
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
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item.productId)}
            >
              <Text style={styles.addToCartText}>Add to cart</Text>
              <Image source={icons.cart} style={styles.cartIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
