import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, ShimmerGrid } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import styles from './styles';

// API Hooks
import { useBrand } from '../../hooks/useBrands';
import { useProducts } from '../../hooks/useProducts';
import { getFirstImageSource, getImageSource } from '../../utils/imageHelper';

const { width: screenWidth } = Dimensions.get('window');

type StoreDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StoreDetail'>;

interface StoreDetailScreenProps {
  navigation: StoreDetailScreenNavigationProp;
  route: {
    params: {
      storeId: string;
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
}

const StoreDetailScreen: React.FC<StoreDetailScreenProps> = ({ 
  navigation,
  route
}) => {
  const { storeId, storeData } = route.params;

  // Fetch brand data
  const { data: brandData, isLoading: brandLoading } = useBrand(storeId);
  const brand = brandData?.data || storeData;

  // Fetch products by brand
  const { data: productsData, isLoading: productsLoading } = useProducts({
    brand: brand?.name,
    status: 'active',
    limit: 20,
  });

  const products = productsData?.data || [];

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
