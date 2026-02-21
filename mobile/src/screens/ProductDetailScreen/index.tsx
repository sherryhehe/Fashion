import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, LoadingScreen, AddReviewModal, CachedImage, Avatar } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import styles from './styles';

// API Hooks
import { useProduct, useRecommendedProducts } from '../../hooks/useProducts';
import { useBrandByName, useBrand } from '../../hooks/useBrands';
import { useAddReview, useProductReviews, useUpdateReview, useDeleteReview } from '../../hooks/useReviews';
import { useAddToCart } from '../../hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist, useIsInWishlist, useWishlist } from '../../hooks/useWishlist';
import { getFirstImageSource, getImageSource } from '../../utils/imageHelper';
import { useQueryClient } from '@tanstack/react-query';
import authService from '../../services/auth.service';
import { requireAuthOrPromptLogin } from '../../utils/guestHelper';

const { width: screenWidth } = Dimensions.get('window');
const carouselItemWidth = screenWidth - 40; // screenWidth minus imageSection margins (20px each side)

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

interface ProductDetailScreenProps {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ navigation, route }) => {
  const { productId } = route.params || {};
  const queryClient = useQueryClient();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const carouselRef = useRef<FlatList>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Reviews pagination state
  const REVIEWS_PER_PAGE = 5;
  const [displayedReviewsCount, setDisplayedReviewsCount] = useState(REVIEWS_PER_PAGE);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Fetch product data from API
  const { data: productData, isLoading, error, refetch: refetchProduct } = useProduct(productId || '');
  const { data: recommendedData, refetch: refetchRecommended } = useRecommendedProducts(4);
  
  // Get product early for brand lookup (but hooks still called unconditionally)
  const product = productData?.data;
  const productBrandName = product?.brand || '';
  
  // Fetch brand data - hooks called unconditionally with empty string if no brand
  const { data: brandAPIData, refetch: refetchBrandByName } = useBrandByName(productBrandName);
  const brandFromNameLookup = brandAPIData?.data && !Array.isArray(brandAPIData.data) ? brandAPIData.data : (Array.isArray(brandAPIData?.data) ? brandAPIData?.data?.[0] : null);
  const brandId = brandFromNameLookup?._id || '';
  const { data: exactBrandData, refetch: refetchBrand } = useBrand(brandId);
  const brandFromAPI = exactBrandData?.data || brandFromNameLookup;

  // Review hooks
  const addReviewMutation = useAddReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useProductReviews(productId || '');
  // Handle both array response and object with data property
  // Also check if product has embedded reviews (from admin form)
  const apiReviews = Array.isArray(reviewsData?.data) 
    ? reviewsData.data 
    : Array.isArray(reviewsData) 
      ? reviewsData 
      : [];
  const embeddedReviews = product?.reviews || [];
  // Combine API reviews with embedded reviews, prioritizing API reviews
  const allReviews = apiReviews.length > 0 ? apiReviews : embeddedReviews;
  
  // Get displayed reviews based on pagination
  const reviews = allReviews.slice(0, displayedReviewsCount);
  const hasMoreReviews = allReviews.length > displayedReviewsCount;
  
  // Reset displayed count when reviews change
  useEffect(() => {
    setDisplayedReviewsCount(REVIEWS_PER_PAGE);
  }, [productId]);
  
  const handleLoadMoreReviews = () => {
    setDisplayedReviewsCount(prev => prev + REVIEWS_PER_PAGE);
  };
  
  // Get current user info for review ownership
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const user = await authService.getStoredUser();
        setCurrentUserId(user?.id || null);
      } catch (error) {
        console.log('Error getting user info:', error);
      }
    };
    getUserInfo();
  }, []);

  // Cart and wishlist mutations
  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  // Check if product is in wishlist
  const { data: isInWishlist, refetch: refetchWishlist } = useIsInWishlist(productId || '');
  
  // Get wishlist data for refreshing
  const { refetch: refetchWishlistData } = useWishlist();

  // Debug: Log reviews data to verify what's being fetched
  useEffect(() => {
    if (productId) {
      console.log('📝 ProductDetailScreen - Reviews Debug:', {
        productId,
        reviewsCount: allReviews.length,
        displayedReviewsCount: reviews.length,
        productReviewCount: product?.reviewCount,
        reviewsDataRaw: reviewsData,
        reviewsArray: allReviews,
        reviewsLoading,
        reviewsError: reviewsError ? JSON.stringify(reviewsError) : null,
      });
    }
  }, [productId, reviews.length, product?.reviewCount, reviewsData, reviewsLoading, reviewsError]);

  // Check wishlist for saved color/size and auto-select - MUST be before conditional returns
  useEffect(() => {
    if (productId && isInWishlist) {
      // Get wishlist data to check for saved color/size
      const wishlistData = queryClient.getQueryData(['wishlist']) as any;
      const wishlistItem = wishlistData?.data?.find(
        (w: any) => w.productId === productId || w.product?._id === productId
      );
      
      if (wishlistItem) {
        // Auto-select saved color and size (only if not already set)
        if (wishlistItem.color && selectedColor === '') {
          setSelectedColor(wishlistItem.color);
        }
        if (wishlistItem.size && selectedSize === '') {
          setSelectedSize(wishlistItem.size);
        }
      }
    }
  }, [productId, isInWishlist, queryClient]);

  // Pull to refresh handler - MUST be before conditional returns (useCallback is a hook)
  const onRefresh = React.useCallback(async () => {
    if (!productId) return;
    
    setRefreshing(true);
    try {
      // Invalidate and refetch all queries related to this product
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['product', productId] }),
        queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] }),
        queryClient.invalidateQueries({ queryKey: ['brand'] }),
        queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
        // Refetch all data
        refetchProduct(),
        refetchReviews(),
        refetchRecommended(),
        refetchWishlist(),
        refetchWishlistData(),
        // Refetch brand data if brand exists
        productBrandName && refetchBrandByName(),
        brandId && refetchBrand(),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [productId, queryClient, refetchProduct, refetchReviews, refetchRecommended, refetchWishlist, refetchWishlistData, refetchBrandByName, refetchBrand, productBrandName, brandId]);

  // Show loading screen while fetching product
  if (isLoading) {
    return <LoadingScreen message="Loading product details..." variant="full" />;
  }

  // Show error if product not found
  if (error || !product) {
    return (
      <SafeView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={icons.backArrow} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Not Found</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#666', textAlign: 'center' }}>
            Sorry, we couldn't find this product.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20, padding: 15, backgroundColor: '#007AFF', borderRadius: 8 }}
          >
            <Text style={{ color: '#FFF', fontSize: 16 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeView>
    );
  }

  // Brand/Shop data from API or product
  const brandData = {
    name: product.brand || 'Fashion Store',
    avatar: brandFromAPI?.logo ? getImageSource(brandFromAPI.logo, images.shopLogo) : images.shopLogo,
    isVerified: brandFromAPI?.verified || false,
    rating: brandFromAPI?.rating || 0,
    reviewCount: brandFromAPI?.reviewCount || 0,
  };

  // Handle thumbnail click to scroll carousel
  const handleThumbnailPress = (index: number) => {
    setCurrentImageIndex(index);
    try {
      carouselRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    } catch (error) {
      // Handle potential scrollToIndex errors (e.g., if index is out of bounds)
      console.log('ScrollToIndex error:', error);
    }
  };

  // Format product images from API
  const productImages = product.images?.map((image, index) => ({
    id: String(index),
    image: getImageSource(image, images.homesliderimage) || images.homesliderimage,
  })) || [{
    id: '1',
    image: images.homesliderimage,
  }];

  // Helper function to extract colors from variations
  const getColorsFromVariations = () => {
    if (!product.variations || product.variations.length === 0) return [];
    
    const uniqueColors = new Map<string, { id: string; name: string; color: string }>();
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
    };

    product.variations.forEach((variation, index) => {
      if (variation.color && !uniqueColors.has(variation.color)) {
        const colorName = variation.color.toLowerCase();
        const colorCode = colorMap[colorName] || '#8E8E93';
        uniqueColors.set(variation.color, {
          id: String(index),
          name: variation.color,
          color: colorCode,
        });
      }
    });

    return Array.from(uniqueColors.values());
  };

  // Helper function to extract sizes from variations
  const getSizesFromVariations = () => {
    if (!product.variations || product.variations.length === 0) {
      return ['S', 'M', 'L', 'XL']; // Default sizes
    }
    
    const uniqueSizes = new Set<string>();
    product.variations.forEach((variation) => {
      if (variation.size) {
        uniqueSizes.add(variation.size);
      }
    });

    return Array.from(uniqueSizes);
  };

  // Available colors from product variations
  const colors = getColorsFromVariations();

  // Available sizes from product variations
  const sizes = getSizesFromVariations();

  // Set initial selected color and size if not set
  if (!selectedColor && colors.length > 0) {
    setSelectedColor(colors[0].name);
  }
  if (!selectedSize && sizes.length > 0) {
    setSelectedSize(sizes[0]);
  }

  // Handle review submission
  const handleReviewSubmit = async (reviewData: {
    rating: number;
    comment: string;
    name: string;
  }) => {
    if (!productId) return;

    try {
      // Get user info if authenticated
      const user = await authService.getStoredUser();
      const userName = user?.name || reviewData.name;

      await addReviewMutation.mutateAsync({
        productId: productId!,
        rating: reviewData.rating,
        comment: reviewData.comment,
        name: userName, // Use authenticated user's name if available
      });
      setShowReviewModal(false);
      // Refetch reviews and product after adding review
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      // Refresh user info to update currentUserId
      const updatedUser = await authService.getStoredUser();
      setCurrentUserId(updatedUser?.id || null);
    } catch (error) {
      console.log('Review submission error:', error);
    }
  };

  // Handle add to cart - just adds product without navigation
  const handleAddToCart = async () => {
    if (!productId || !product) return;

    // Check if user is guest and prompt login
    const isAuthenticated = await requireAuthOrPromptLogin(
      'add items to cart',
      async () => {
        // Clear guest mode and logout to force navigation to login
        await authService.logout();
        // Navigation will be handled by MainNavigator when isAuthenticated becomes false
      }
    );

    if (!isAuthenticated) {
      return; // User chose not to login
    }

    try {
      await addToCartMutation.mutateAsync({
        productId,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
      // Toast notification is shown automatically by useAddToCart hook
    } catch (error: any) {
      console.log('Add to cart error:', error);
      // If error is 401, user needs to login
      if (error?.status === 401 || error?.message?.includes('No token') || error?.message?.includes('Unauthorized')) {
        Alert.alert(
          'Login Required',
          'Please login to add items to your cart.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Login',
              onPress: () => {
                navigation.navigate('Auth', {
                  setIsAuthenticated: (auth: boolean) => {},
                });
              },
            },
          ]
        );
      }
      // Error toast is shown automatically by useAddToCart hook
    }
  };

  // Handle buy now - add to cart and redirect to checkout
  const handleBuyNow = async () => {
    if (!productId || !product) return;

    // Check if user is guest and prompt login
    const isAuthenticated = await requireAuthOrPromptLogin(
      'proceed with checkout',
      async () => {
        // Clear guest mode and logout to force navigation to login
        await authService.logout();
        // Navigation will be handled by MainNavigator when isAuthenticated becomes false
      }
    );

    if (!isAuthenticated) {
      return; // User chose not to login
    }

    try {
      await addToCartMutation.mutateAsync({
        productId,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
      // Navigate to Cart tab first, then to Checkout
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Home',
          params: {
            screen: 'CartStack',
            params: {
              screen: 'Cart',
            },
          },
        })
      );
      // Small delay to ensure cart is updated, then navigate to checkout
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'Home',
            params: {
              screen: 'CartStack',
              params: {
                screen: 'Checkout',
              },
            },
          })
        );
      }, 300);
    } catch (error: any) {
      console.log('Buy now error:', error);
      // If error is 401, user needs to login
      if (error?.status === 401 || error?.message?.includes('No token') || error?.message?.includes('Unauthorized')) {
        Alert.alert(
          'Login Required',
          'Please login to proceed with checkout.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Login',
              onPress: () => {
                navigation.navigate('Auth', {
                  setIsAuthenticated: (auth: boolean) => {},
                });
              },
            },
          ]
        );
      }
    }
  };

  // Handle toggle wishlist
  const handleToggleWishlist = async () => {
    if (!productId) return;

    // Check if user is guest and prompt login
    const isAuthenticated = await requireAuthOrPromptLogin(
      'add items to wishlist',
      navigation
    );

    if (!isAuthenticated) {
      return; // User chose not to login
    }

    try {
      const currentlyInWishlist = isInWishlist || isFavorite;
      
      if (currentlyInWishlist) {
        // Remove from wishlist
        await removeFromWishlistMutation.mutateAsync(productId);
        setIsFavorite(false);
      } else {
        // Add to wishlist with current selected color and size
        await addToWishlistMutation.mutateAsync({
          productId,
          color: selectedColor || undefined,
          size: selectedSize || undefined,
        });
        setIsFavorite(true);
      }
      
      // Refetch wishlist status
      refetchWishlist();
    } catch (error: any) {
      console.log('Toggle wishlist error:', error);
      // If error is 401, user needs to login
      if (error?.status === 401 || error?.message?.includes('No token') || error?.message?.includes('Unauthorized')) {
        Alert.alert(
          'Login Required',
          'Please login to add items to your wishlist.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Login',
              onPress: async () => {
                await authService.logout();
                // Navigation will be handled by MainNavigator
              },
            },
          ]
        );
      }
    }
  };

  const renderImageItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.imageContainer, { width: carouselItemWidth }]}>
      <CachedImage 
        source={item.image} 
        style={styles.mainImage}
        resizeMode="cover"
        priority="high"
        cache="immutable"
      />
    </View>
  );

  const renderThumbnailItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        index === currentImageIndex && styles.selectedThumbnail
      ]}
      onPress={() => handleThumbnailPress(index)}
    >
      <CachedImage 
        source={item.image} 
        style={styles.thumbnailImage}
        resizeMode="cover"
        priority="normal"
        cache="immutable"
      />
    </TouchableOpacity>
  );

  const renderColorItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.colorItem,
        selectedColor === item.name && styles.selectedColorItem
      ]}
      onPress={() => setSelectedColor(item.name)}
    >
      <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
      <Text style={[
        styles.colorText,
        selectedColor === item.name && styles.selectedColorText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSizeItem = (size: string) => (
    <TouchableOpacity
      key={size}
      style={[
        styles.sizeButton,
        selectedSize === size && styles.selectedSizeButton
      ]}
      onPress={() => setSelectedSize(size)}
    >
      <Text style={[
        styles.sizeText,
        selectedSize === size && styles.selectedSizeText
      ]}>
        {size}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeView>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        // Prevent gesture conflicts on Android
        nestedScrollEnabled={true}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          {/* Main Image Carousel */}
          <View style={styles.mainImageContainer}>
            <FlatList
              ref={carouselRef}
              data={productImages}
              renderItem={renderImageItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / carouselItemWidth);
                setCurrentImageIndex(index);
              }}
              style={styles.imageCarousel}
              // Prevent gesture conflicts with system navigation
              scrollEventThrottle={16}
              decelerationRate="fast"
              bounces={false}
              overScrollMode="never"
              // Android specific gesture handling
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
            />
            
            {/* Thumbnail Gallery */}
            <View style={styles.thumbnailGallery}>
              <FlatList
                data={productImages}
                renderItem={renderThumbnailItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
                // Prevent gesture conflicts
                scrollEventThrottle={16}
                decelerationRate="fast"
                bounces={false}
                overScrollMode="never"
                nestedScrollEnabled={true}
              />
            </View>
          </View>

          {/* Pagination Indicators */}
          <View style={styles.paginationContainer}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.activePaginationDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Information Section */}
        <View style={styles.productInfoSection}>
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Image
                  key={star}
                  source={icons.star}
                  style={[
                    styles.starIcon,
                    star <= product.rating && styles.filledStar
                  ]}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{product.rating.toFixed(1)} ({product.reviewCount})</Text>
          </View>

          {/* Product Name and Price */}
          <View style={styles.namePriceContainer}>
            <View style={styles.namePriceLeft}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.productPrice}>PKR {product.price.toLocaleString()}</Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <Text style={{ fontSize: 16, color: '#8E8E93', textDecorationLine: 'line-through' }}>
                      PKR {product.originalPrice.toLocaleString()}
                    </Text>
                    {product.discount && (
                      <View style={{ backgroundColor: '#FF3B30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                          {product.discount}% OFF
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                (addToWishlistMutation.isPending || removeFromWishlistMutation.isPending) && styles.favoriteButtonDisabled
              ]}
              onPress={handleToggleWishlist}
              disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
            >
              {addToWishlistMutation.isPending || removeFromWishlistMutation.isPending ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Image
                  source={(isFavorite || isInWishlist) ? icons.headrtFilled : icons.favorite}
                  style={[
                    styles.favoriteIcon,
                    (isFavorite || isInWishlist) && styles.favoriteIconFilled
                  ]}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Brand/Shop Section - use brand from exact name lookup only; navigate only when name matches product's brand */}
          <TouchableOpacity 
            style={styles.brandSection}
            onPress={() => {
              const brandIdToNavigate = brandFromNameLookup?._id || brandFromNameLookup?.id;
              const lookupName = (brandFromNameLookup?.name ?? '').trim().toLowerCase();
              const productBrand = (productBrandName ?? '').trim().toLowerCase();
              const nameMatches = lookupName && productBrand && lookupName === productBrand;
              if (brandIdToNavigate && nameMatches) {
                navigation.navigate('StoreDetail', { storeId: brandIdToNavigate });
              }
            }}
          >
            <View style={styles.brandInfo}>
              <Image source={brandData.avatar} style={styles.brandAvatar} />
              <View style={styles.brandDetails}>
                <View style={styles.brandNameRow}>
                  <Text style={styles.brandName}>{brandData.name}</Text>
                  {brandData.isVerified && (
                    <Image source={icons.verify} style={styles.verifyIcon} />
                  )}
                </View>
                <View style={styles.brandStats}>
                  {brandData.rating > 0 && (
                    <View style={styles.brandRating}>
                      <Image source={icons.star} style={styles.brandStarIcon} />
                      <Text style={styles.brandRatingText}>{brandData.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  {brandData.reviewCount > 0 && (
                    <Text style={styles.brandFollowers}>{brandData.reviewCount} reviews</Text>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>

        </View>

        {/* Available Colors Section */}
        <View style={styles.colorsSection}>
          <Text style={styles.sectionTitle}>Available Colors</Text>
          <FlatList
            data={colors}
            renderItem={renderColorItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorsList}
            // Prevent gesture conflicts
            scrollEventThrottle={16}
            decelerationRate="fast"
            bounces={false}
            overScrollMode="never"
            nestedScrollEnabled={true}
          />
        </View>

        {/* Sizes Section */}
        <View style={styles.sizesSection}>
          <View style={styles.sizesHeader}>
            <Text style={styles.sectionTitle}>Sizes</Text>
            <TouchableOpacity>
              <Text style={styles.sizeChartText}>Size Chart</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sizesContainer}>
            {sizes.map(renderSizeItem)}
          </View>
        </View>

        {/* Quantity Section */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
           <Image source={icons.minus} style={styles.quantityButtonImage} />    
           </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
                <Image source={icons.plus} tintColor='#FFFFFF' style={styles.quantityButtonImage} />    
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {product.description || 'No description available for this product.'}
          </Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length > 0 ? reviews.length : (product?.reviewCount || 0)})</Text>
            <TouchableOpacity 
              style={styles.addReviewButton}
              onPress={() => setShowReviewModal(true)}
            >
              <Text style={styles.addReviewText}>Add Review</Text>
            </TouchableOpacity>
          </View>
          
          {reviewsLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2C2C2E" />
              <Text style={{ fontSize: 14, color: '#8E8E93', marginTop: 10 }}>Loading reviews...</Text>
            </View>
          ) : reviewsError ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#FF3B30', marginBottom: 10 }}>
                Failed to load reviews
              </Text>
              <TouchableOpacity 
                onPress={() => refetchReviews()}
                style={{ padding: 10, backgroundColor: '#F2F2F7', borderRadius: 8 }}
              >
                <Text style={{ fontSize: 14, color: '#2C2C2E' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : allReviews && allReviews.length > 0 ? (
            <>
              {reviews.map((review: any, index: number) => {
              const isOwnReview = currentUserId && review.userId === currentUserId;
              const isAdminReview = review.isAdmin;
              
              return (
                <View key={review._id || review.id || index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Avatar
                        name={review.name || 'Anonymous'}
                        avatar={review.avatar}
                        size={40}
                        style={styles.reviewerAvatar}
                      />
                      <View style={styles.reviewerDetails}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.reviewerName}>{review.name || 'Anonymous'}</Text>
                          {isAdminReview && (
                            <View style={{ marginLeft: 6, flexDirection: 'row', alignItems: 'center' }}>
                              <Image source={icons.verify} style={{ width: 12, height: 12, marginRight: 4 }} />
                              <Text style={{ fontSize: 10, color: '#007AFF', fontWeight: '600' }}>Admin</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.reviewRating}>
                          <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Image
                                key={star}
                                source={icons.star}
                                style={[
                                  styles.starIcon,
                                  star <= review.rating && styles.filledStar
                                ]}
                              />
                            ))}
                          </View>
                          <Text style={styles.reviewRatingText}>{review.rating?.toFixed(1) || '0.0'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.reviewTime}>
                        {review.date ? new Date(review.date).toLocaleDateString() : 
                         review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 
                         'Recently'}
                      </Text>
                      {isOwnReview && (
                        <View style={{ flexDirection: 'row', marginTop: 4, gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Edit Review',
                                'Edit review functionality coming soon',
                                [{ text: 'OK' }]
                              );
                            }}
                          >
                            <Text style={{ fontSize: 12, color: '#007AFF' }}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Delete Review',
                                'Are you sure you want to delete this review?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                      try {
                                        await deleteReviewMutation.mutateAsync(review._id || review.id);
                                        queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] });
                                        queryClient.invalidateQueries({ queryKey: ['product', productId] });
                                      } catch (error) {
                                        console.log('Delete review error:', error);
                                      }
                                    },
                                  },
                                ]
                              );
                            }}
                          >
                            <Text style={{ fontSize: 12, color: '#FF3B30' }}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>
                    {review.comment || 'No comment provided'}
                  </Text>
                  {review.verified && !isAdminReview && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <Image source={icons.verify} style={{ width: 14, height: 14, marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: '#34C759' }}>Verified Purchase</Text>
                    </View>
                  )}
                </View>
              );
              })}
              {hasMoreReviews && (
                <View style={styles.loadMoreReviewsContainer}>
                  <TouchableOpacity
                    style={styles.loadMoreReviewsButton}
                    onPress={handleLoadMoreReviews}
                  >
                    <Text style={styles.loadMoreReviewsText}>
                      Load More Reviews ({allReviews.length - displayedReviewsCount} remaining)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#8E8E93', textAlign: 'center' }}>
                No reviews yet. Be the first to review this product!
              </Text>
            </View>
          )}
        </View>

        {/* Recommended Products Section */}
        {recommendedData?.data && recommendedData.data.length > 0 && (
          <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Search', {
                autoFocus: false,
                headerText: 'Recommended Products',
                searchPlaceholder: 'Search recommended products...',
              })}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={recommendedData.data.map(product => ({
                id: product._id,
                name: product.name,
                price: `PKR ${product.price.toLocaleString()}`,
                rating: `${product.rating.toFixed(1)} (${product.reviewCount})`,
                brand: product.brand || '',
                image: getFirstImageSource(product.images, images.buttondownshirt),
              }))}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recommendedItem}
                  onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                >
                  <CachedImage source={item.image} style={styles.recommendedImage} priority="normal" cache="immutable" />
                  <View style={styles.recommendedContent}>
                    {item.brand ? (
                      <View style={styles.recommendedBrandRow}>
                        <View style={styles.recommendedBrand}>
                          <View style={styles.brandLogoPlaceholder} />
                          <Text style={styles.brandName}>{item.brand}</Text>
                          <Image source={icons.verify} style={styles.verifyIcon} />
                        </View>
                      </View>
                    ) : null}
                      <View style={styles.recommendedRating}>
                        <Image source={icons.star} style={styles.recommendedStarIcon} />
                        <Text style={styles.recommendedRatingText}>{item.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.recommendedProductName}>{item.name}</Text>
                    <View style={styles.recommendedPriceButtonRow}>
                      <Text style={styles.recommendedPrice}>{item.price}</Text>
                      <TouchableOpacity 
                        style={styles.addToCartButton}
                        onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                      >
                        <Text style={styles.addToCartText}>View</Text>
                        <Image source={icons.cart} style={styles.addToCartIcon} />
                      </TouchableOpacity>
                    </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
              // Prevent gesture conflicts
              scrollEventThrottle={16}
              decelerationRate="fast"
              bounces={false}
              overScrollMode="never"
              nestedScrollEnabled={true}
            />
          </View>
        )}

        {/* Bottom Action Bar */}
        <View style={styles.bottomActionBar}>
          <TouchableOpacity 
            style={[styles.cartButton, addToCartMutation.isPending && styles.cartButtonDisabled]}
            onPress={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <ActivityIndicator size="small" color="#2C2C2E" />
            ) : (
              <Image source={icons.cart} style={styles.cartIcon} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleBuyNow}
            disabled={addToCartMutation.isPending}
          >
            <Text style={styles.checkoutButtonText}>
              {addToCartMutation.isPending ? 'Processing...' : 'Buy Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Review Modal */}
      <AddReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        productName={product?.name || 'Product'}
        isLoading={addReviewMutation.isPending}
      />
    </SafeView>
  );
};

export default ProductDetailScreen;
