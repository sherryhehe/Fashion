import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/HomeNavigator';
import { SafeView, ShimmerCategoryItem, ShimmerProductCard, ShimmerBrandItem } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import styles from './styles';

// API Hooks
import { useCategories } from '../../hooks/useCategories';
import { useTopSellingProducts } from '../../hooks/useProducts';
import { useTopBrands } from '../../hooks/useBrands';
import { getFirstImageSource, getImageSource } from '../../utils/imageHelper';

const { width: screenWidth } = Dimensions.get('window');

type CategoriesScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Categories'>;

interface CategoriesScreenProps {
  navigation: CategoriesScreenNavigationProp;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ 
  navigation
}) => {
  // API Hooks
  const { data: topProductsAPIData, isLoading: productsLoading } = useTopSellingProducts(3);
  const { data: categoriesAPIData, isLoading: categoriesLoading } = useCategories();
  const { data: topBrandsAPIData, isLoading: brandsLoading } = useTopBrands();

  // Format price helper
  const formatPrice = (price: number) => `Rs.${price.toLocaleString()}`;

  // Format top products data from API
  const topProductsData = topProductsAPIData?.data?.map(product => ({
    id: product._id,
    name: product.name,
    price: formatPrice(product.price),
    brand: product.brand || '',
    image: getFirstImageSource(product.images, images.bottomList.casual),
  })) || [];

  // Helper function to get category background color
  const getCategoryColor = (index: number) => {
    const colors = ['#FFD700', '#FFA500', '#808080', '#FF8C00', '#87CEEB'];
    return colors[index % colors.length];
  };

  // Format categories data from API - use actual images from backend
  const categoriesData = categoriesAPIData?.data?.slice(0, 5).map((category, index) => ({
    id: category._id,
    name: category.name,
    backgroundColor: getCategoryColor(index),
    // Use actual image from API, fallback to local image only if no image from API
    image: category.image 
      ? getImageSource(category.image, images.bags)
      : (() => {
          // Fallback to name-based mapping only if no image from API
          const name = category.name.toLowerCase();
          if (name.includes('bag')) return images.bags;
          if (name.includes('makeup') || name.includes('beauty')) return images.makeup;
          if (name.includes('shirt') || name.includes('cloth')) return images.tshirts;
          if (name.includes('shoe') || name.includes('sneaker')) return images.sneakers;
          return images.bags;
        })(),
    isLarge: index === 4, // Make the 5th item large
  })) || [];

  // Helper function to get brand background color (alternate between white and black)
  const getBrandColor = (index: number) => {
    return index % 3 === 1 ? '#000000' : '#FFFFFF';
  };

  const getBrandTextColor = (index: number) => {
    return index % 3 === 1 ? '#FFFFFF' : '#000000';
  };

  // Format top brands data from API
  const topBrandsData = topBrandsAPIData?.data?.slice(0, 8).map((brand, index) => ({
    id: brand._id,
    name: brand.name,
    logo: brand.name.toUpperCase(),
    backgroundColor: getBrandColor(index),
    textColor: getBrandTextColor(index),
    logoImage: getImageSource(brand.logo, images.shopLogo),
  })) || [];

  // No need for full loading screen - show shimmer loaders per section

  const renderTopProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.topProductCard}
      onPress={() => navigation.getParent()?.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.topProductImageContainer}>
        <Image source={item.image} style={styles.topProductImage} />
        <TouchableOpacity style={styles.topProductCartButton}>
          <Image source={icons.whiteCart} style={styles.topProductCartIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.topProductContent}>
        <View style={styles.topProductBrandContainer}>
          <Text style={styles.topProductBrand}>{item.brand}</Text>
          <Image source={icons.verify} style={styles.topProductVerifyIcon} />
        </View>
        <Text style={styles.topProductName}>{item.name}</Text>
        <Text style={styles.topProductPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.categoryCard,
        item.isLarge && styles.categoryCardLarge
      ]}
      onPress={() => navigation.getParent()?.navigate('Search', { autoFocus: false, headerText: item.name })}
    >
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryColorSection, { backgroundColor: item.backgroundColor }]}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <TouchableOpacity 
            style={styles.shopNowButton}
            onPress={() => navigation.getParent()?.navigate('Search', { autoFocus: false, headerText: item.name })}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.categoryRight}>
        <Image source={item.image} style={styles.categoryImage} />
      </View>
    </TouchableOpacity>
  );

  const renderBrand = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.brandCard}
      onPress={() => navigation.getParent()?.navigate('StoreDetail', { storeId: item.id })}
    >
      <View style={[
        styles.brandLogoContainer,
        { backgroundColor: item.backgroundColor }
      ]}>
        {item.logoImage ? (
          <Image source={item.logoImage} style={styles.brandLogoImage} />
        ) : (
          <Text style={[styles.brandLogoText, { color: item.textColor }]}>
            {item.logo}
          </Text>
        )}
      </View>
      <Text style={styles.brandName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Image source={icons.search} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search brands, items or styles..."
              placeholderTextColor="#8E8E93"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Image source={icons.filter} style={styles.filterIcon} />
          </TouchableOpacity>
        </View>

        {/* Top Products Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          {productsLoading ? (
            <View style={styles.horizontalList}>
              <FlatList
                data={[1, 2, 3]}
                renderItem={() => <ShimmerProductCard />}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topProductsList}
              />
            </View>
          ) : topProductsData.length > 0 ? (
            <FlatList
              data={topProductsData}
              renderItem={renderTopProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topProductsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Image source={icons.search} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>No top products available at the moment.</Text>
            </View>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categoriesLoading ? (
            <View style={styles.categoriesGrid}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.categoryWrapper}>
                  <ShimmerCategoryItem />
                </View>
              ))}
            </View>
          ) : categoriesData.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {categoriesData.map((item) => (
                <View key={item.id} style={styles.categoryWrapper}>
                  {renderCategory({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Image source={icons.search} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Categories Found</Text>
              <Text style={styles.emptySubtitle}>No categories available at the moment.</Text>
            </View>
          )}
        </View>

        {/* Top Brands Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Top Brands</Text>
          {brandsLoading ? (
            <View style={styles.brandsGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <View key={item} style={styles.brandWrapper}>
                  <ShimmerBrandItem />
                </View>
              ))}
            </View>
          ) : topBrandsData.length > 0 ? (
            <View style={styles.brandsGrid}>
              {topBrandsData.map((item) => (
                <View key={item.id} style={styles.brandWrapper}>
                  {renderBrand({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Image source={icons.search} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Brands Found</Text>
              <Text style={styles.emptySubtitle}>No brands available at the moment.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
};

export default CategoriesScreen;
