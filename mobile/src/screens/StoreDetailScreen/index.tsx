import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, ShimmerGrid } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import styles from './styles';
import { useQueryClient } from '@tanstack/react-query';

// API Hooks
import { useBrand } from '../../hooks/useBrands';
import { useProducts } from '../../hooks/useProducts';
import { getFirstImageSource, getImageSource } from '../../utils/imageHelper';

const { width: screenWidth } = Dimensions.get('window');

type StoreDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StoreDetail'>;
type StoreDetailRouteProp = {
  key: string;
  name: 'StoreDetail';
  params?: {
    storeId?: string;
    storeData?: {
      id: string;
      name: string;
      description: string;
      rating: string;
      image: any;
      storeName: string;
      storeType: string;
      bannerImage: any;
      logoImage: any;
    };
  };
};

interface StoreDetailScreenProps {
  navigation: StoreDetailScreenNavigationProp;
  route: StoreDetailRouteProp;
}

const StoreDetailScreen: React.FC<StoreDetailScreenProps> = ({ 
  navigation,
  route: routeProp
}) => {
  // Use useRoute hook for better type safety and to get updated params
  const route = useRoute<StoreDetailRouteProp>();
  const queryClient = useQueryClient();
  
  // Safely extract route params with fallbacks
  const storeId = route.params?.storeId || routeProp.params?.storeId || '';
  const storeData = route.params?.storeData || routeProp.params?.storeData;
  
  // State to track previous storeId to detect changes
  const [previousStoreId, setPreviousStoreId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Watch for route param changes and invalidate cache when storeId changes
  useEffect(() => {
    if (__DEV__) {
      console.log('🏪 StoreDetailScreen - Route params changed:', {
        storeId,
        previousStoreId,
        hasStoreData: !!storeData,
      });
    }
    
    // If storeId changed, invalidate the old query and update previousStoreId
    if (storeId && storeId !== previousStoreId) {
      // Invalidate previous query if it exists
      if (previousStoreId) {
        queryClient.invalidateQueries({ queryKey: ['brand', previousStoreId] });
      }
      
      // Invalidate and refetch brand query for new storeId
      queryClient.invalidateQueries({ queryKey: ['brand', storeId] });
      
      // Update previous storeId
      setPreviousStoreId(storeId);
      
      if (__DEV__) {
        console.log('🔄 StoreDetailScreen - StoreId changed, invalidated queries. Old:', previousStoreId, 'New:', storeId);
      }
    } else if (!previousStoreId && storeId) {
      // First time setting storeId
      setPreviousStoreId(storeId);
    }
  }, [storeId, previousStoreId, queryClient, storeData]);

  // Refetch when screen comes into focus to ensure fresh data
  useFocusEffect(
    React.useCallback(() => {
      if (storeId) {
        // Refetch brand data when screen is focused
        queryClient.invalidateQueries({ queryKey: ['brand', storeId] });
        
        if (__DEV__) {
          console.log('👁️ StoreDetailScreen - Screen focused, refetching brand:', storeId);
        }
      }
    }, [storeId, queryClient])
  );

  // Fetch brand data - only if storeId exists
  const { data: brandData, isLoading: brandLoading, error: brandError, refetch: refetchBrand } = useBrand(storeId);
  const brand = brandData?.data || storeData;
  
  // Debug logging for brand data
  useEffect(() => {
    if (__DEV__) {
      console.log('🏪 StoreDetailScreen - Brand data:', {
        storeId,
        hasBrandData: !!brandData,
        brandName: brand?.name,
        isLoading: brandLoading,
        error: brandError,
      });
    }
  }, [storeId, brandData, brand, brandLoading, brandError]);

  // Fetch products by brand - only if brand name is available
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useProducts({
    brand: brand?.name || '',
    status: 'active',
    limit: 20,
  });

  const products = productsData?.data || [];

  // Show error state if storeId is missing
  if (!storeId) {
    return (
      <SafeView>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image source={icons.backArrow} style={styles.backIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Image source={icons.search} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Store Not Found</Text>
            <Text style={styles.emptySubtitle}>
              Unable to load store details. Please try again.
            </Text>
          </View>
        </ScrollView>
      </SafeView>
    );
  }

  // Format products for display
  const formatPrice = (price: number) => `Rs.${price.toLocaleString()}`;
  const formatRating = (rating: number, reviewCount: number) => `${rating.toFixed(1)} (${reviewCount})`;

  const productData = products.map((product: any) => ({
    id: product._id,
    name: product.name,
    price: formatPrice(product.price),
    rating: formatRating(product.rating, product.reviewCount),
    image: getFirstImageSource(product.images, images.bottomList.image1),
  }));

  // No need for full loading screen - show shimmer loaders in place

  // Remove non-functional tabs - they don't filter products
  // Products are already filtered by brand name

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    if (!storeId) return;
    
    setRefreshing(true);
    try {
      // Invalidate and refetch all queries related to this brand
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['brand', storeId] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        // Refetch all data
        refetchBrand(),
        refetchProducts(),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [storeId, queryClient, refetchBrand, refetchProducts]);

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} />
      </View>
      <View style={styles.productContent}>
        <View style={styles.productRatingContainer}>
          <Image source={icons.star} style={styles.starIcon} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.brandContainer}>
          {brand?.logo ? (
            <Image 
              source={getImageSource(brand.logo, images.shopLogo)} 
              style={styles.brandLogo} 
            />
          ) : (
            <View style={styles.brandLogoPlaceholder} />
          )}
          {(brand?.name || item.brand) && (
            <Text style={styles.brandName}>{brand?.name || item.brand}</Text>
          )}
          {brand?.verified && (
            <Image source={icons.verify} style={styles.verifyIcon} />
          )}
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Removed non-functional tabs

  return (
    <SafeView>
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
        {/* Header with Banner */}
        <View style={styles.headerContainer}>
          <Image 
            source={brand?.banner ? getImageSource(brand.banner, images.shopBanner) : images.shopBanner} 
            style={styles.bannerImage} 
          />
          
          {/* Back Arrow */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={icons.backArrow} style={styles.backIcon} />
          </TouchableOpacity>

          {/* Store Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={brand?.logo ? getImageSource(brand.logo, images.shopLogo) : images.shopLogo} 
              style={styles.storeLogo} 
            />
          </View>
        </View>

        {/* Store Information */}
        <View style={styles.storeInfoContainer}>
          <View style={styles.storeInfoLeft}>
            <View style={styles.storeNameContainer}>
              <Text style={styles.storeName}>
                {brand?.name || storeData?.name || storeData?.storeName || 'Store'}
              </Text>
              {brand?.verified && (
                <Image source={icons.verify} style={styles.storeVerifyIcon} />
              )}
            </View>
            <Text style={styles.storeType}>
              {brand?.description || storeData?.description || storeData?.storeType || 'Fashion Brand'}
            </Text>
          </View>
          
          {/* Removed non-functional action buttons */}
        </View>

        {/* Removed non-functional tabs */}

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          {productsLoading ? (
            <ShimmerGrid columns={2} count={6} />
          ) : productData.length > 0 ? (
            <FlatList
              data={productData}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Image source={icons.search} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                This store doesn't have any products available at the moment.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
};

export default StoreDetailScreen;
