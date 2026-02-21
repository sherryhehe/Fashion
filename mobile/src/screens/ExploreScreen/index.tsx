import React, { useState } from 'react';
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
import { HomeStackParamList } from '../../navigation/HomeNavigator';
import { SafeView, ShimmerBrandItem, CachedImage } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import styles from './styles';

import { useRecentlyAddedProducts, useRecommendedProducts } from '../../hooks/useProducts';
import { useTopBrands } from '../../hooks/useBrands';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '../../hooks/useWishlist';
import { getFirstImageSource, getImageSource } from '../../utils/imageHelper';
import { requireAuthOrPromptLogin } from '../../utils/guestHelper';

const { width: screenWidth } = Dimensions.get('window');

type ExploreScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Categories'>;

interface ExploreScreenProps {
  navigation: ExploreScreenNavigationProp;
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const [recommendedLayout, setRecommendedLayout] = useState<'list' | 'grid'>('list');

  const { data: topBrandsAPIData, isLoading: brandsLoading } = useTopBrands();
  const { data: recentlyViewedData } = useRecentlyAddedProducts(6);
  const { data: recommendedData } = useRecommendedProducts(8);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();

  const formatPrice = (price: number) => `Rs.${(price || 0).toLocaleString()}`;

  const recentlyViewedProducts = recentlyViewedData?.data?.map((product: any) => ({
    id: product._id,
    name: product.name,
    price: formatPrice(product.price),
    brand: product.brand || '',
    category: product.category || '',
    image: getFirstImageSource(product.images, images.bottomList.casual),
  })) || [];

  const recommendedProducts = recommendedData?.data?.map((product: any) => ({
    id: product._id,
    name: product.name,
    price: formatPrice(product.price),
    brand: product.brand || '',
    category: product.category || '',
    image: getFirstImageSource(product.images, images.bottomList.casual),
  })) || [];

  const topBrandsData = topBrandsAPIData?.data?.slice(0, 8).map((brand: any, index: number) => ({
    id: brand._id,
    name: brand.name,
    logoImage: getImageSource(brand.logo, images.shopLogo),
    isDark: index % 2 === 1,
  })) || [];

  const isInWishlist = (productId: string) =>
    wishlistData?.data?.some((w: any) => w.productId === productId || w.product?._id === productId) ?? false;

  const handleWishlistPress = async (productId: string) => {
    const ok = await requireAuthOrPromptLogin('add to wishlist', navigation);
    if (!ok) return;
    const inList = isInWishlist(productId);
    if (inList) await removeFromWishlistMutation.mutateAsync(productId);
    else await addToWishlistMutation.mutateAsync({ productId });
  };

  // Product card for horizontal (Recently Viewed) and vertical (Recommended) - same design as reference
  const renderProductCard = ({ item, showFilterIcon = false, fullWidth = false }: { item: any; showFilterIcon?: boolean; fullWidth?: boolean }) => {
    const inWishlist = isInWishlist(item.id);
    return (
      <TouchableOpacity
        style={[styles.productCard, fullWidth && styles.productCardFullWidth]}
        onPress={() => navigation.getParent()?.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.productCardImageWrap}>
          <CachedImage
            source={item.image}
            style={styles.productCardImage}
            priority="high"
            cache="immutable"
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleWishlistPress(item.id)}
            disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
          >
            <Image
              source={inWishlist ? icons.headrtFilled : icons.heart}
              style={styles.heartIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {showFilterIcon && (
            <TouchableOpacity
              style={styles.filterButtonOnCard}
              onPress={() => navigation.getParent()?.navigate('Search', { autoFocus: false })}
            >
              <Image source={icons.filter} style={styles.filterIconOnCard} resizeMode="contain" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.productCardContent}>
          <Text style={styles.productCardBrand} numberOfLines={1}>{item.brand}</Text>
          <Text style={styles.productCardName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productCardPriceRow}>
            <Text style={styles.productCardPrice}>{item.price}</Text>
            {item.category ? (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText} numberOfLines={1}>{item.category}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBrandItem = ({ item, index }: { item: any; index: number }) => {
    if (item.id === 'view-all') {
      return (
        <TouchableOpacity
          style={styles.viewAllBrandCircle}
          onPress={() => navigation.getParent()?.navigate('AllBrands')}
        >
          <View style={styles.viewAllCircle}>
            <Image source={icons.chevronRight} style={styles.viewAllArrow} resizeMode="contain" />
          </View>
          <Text style={styles.viewAllLabel}>View All</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.brandItemWrapper}
        onPress={() => navigation.getParent()?.navigate('StoreDetail', { storeId: item.id })}
        activeOpacity={0.8}
      >
        <View style={[styles.brandLogoCircle, item.isDark && styles.brandLogoCircleDark]}>
          {item.logoImage ? (
            <CachedImage
              source={item.logoImage}
              style={styles.brandCircleImage}
              priority="normal"
              cache="immutable"
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.brandCircleLetter, item.isDark && styles.brandCircleLetterLight]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.brandCircleName} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const brandsWithViewAll = [...topBrandsData, { id: 'view-all', name: 'View All' }];

  return (
    <SafeView>
      {/* Header: Explore title + search (notification tab removed per requirements) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.getParent()?.navigate('Search', { autoFocus: true })}
          >
            <Image source={icons.search} style={styles.headerIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. Shop by Brand - horizontal circular icons + View All */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Brand</Text>
          {brandsLoading ? (
            <FlatList
              data={[1, 2, 3, 4, 5]}
              horizontal
              keyExtractor={(i) => i.toString()}
              renderItem={() => (
                <View style={styles.brandCirclePlaceholder}>
                  <ShimmerBrandItem />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsScrollContent}
            />
          ) : (
            <FlatList
              data={brandsWithViewAll}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => renderBrandItem({ item, index })}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsScrollContent}
            />
          )}
        </View>

        {/* 2. Recently Viewed - View All on right, horizontal product cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Search', { autoFocus: false })}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentlyViewedProducts.length > 0 ? (
            <FlatList
              data={recentlyViewedProducts}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderProductCard({ item })}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsContent}
            />
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No recently viewed items.</Text>
            </View>
          )}
        </View>

        {/* 3. Recommended for You - layout toggles, vertical list */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <View style={styles.layoutToggles}>
              <TouchableOpacity
                style={[styles.layoutToggle, recommendedLayout === 'list' && styles.layoutToggleActive]}
                onPress={() => setRecommendedLayout('list')}
              >
                <View style={styles.listIconOutline} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.layoutToggle, recommendedLayout === 'grid' && styles.layoutToggleActive]}
                onPress={() => setRecommendedLayout('grid')}
              >
                <View style={styles.gridIconOutline}>
                  <View style={styles.gridIconRow}>
                    <View style={styles.gridIconSmall} />
                    <View style={styles.gridIconSmall} />
                  </View>
                  <View style={styles.gridIconRow}>
                    <View style={styles.gridIconSmall} />
                    <View style={styles.gridIconSmall} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {recommendedProducts.length > 0 ? (
            recommendedLayout === 'list' ? (
              <View style={styles.recommendedList}>
                {recommendedProducts.map((item, index) => (
                  <View key={item.id} style={styles.recommendedListItem}>
                    {renderProductCard({ item, showFilterIcon: index === 0, fullWidth: true })}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.recommendedGrid}>
                {recommendedProducts.map((item, index) => (
                  <View key={item.id} style={styles.recommendedGridItem}>
                    {renderProductCard({ item, showFilterIcon: index === 0 })}
                  </View>
                ))}
              </View>
            )
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No recommendations yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
};

export default ExploreScreen;
