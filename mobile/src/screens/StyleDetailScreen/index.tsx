import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, CachedImage } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import { useProducts } from '../../hooks/useProducts';
import { getFirstImageSource } from '../../utils/imageHelper';
import { requireAuthOrPromptLogin } from '../../utils/guestHelper';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

type StyleDetailNavigationProp = StackNavigationProp<RootStackParamList, 'StyleDetail'>;

interface StyleDetailScreenProps {
  navigation: StyleDetailNavigationProp;
  route: { params: { styleName: string } };
}

const StyleDetailScreen: React.FC<StyleDetailScreenProps> = ({ navigation, route }) => {
  const styleName = route.params?.styleName || '';
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const { data: productsData, isLoading } = useProducts({
    style: styleName,
    status: 'active',
    limit: 50,
  });
  const products = productsData?.data || [];

  const formatPrice = (p: number) => `Rs.${(p || 0).toLocaleString()}`;

  const handleWishlistPress = async (productId: string) => {
    const ok = await requireAuthOrPromptLogin('add to wishlist', navigation);
    if (!ok) return;
    // Toggle is handled by the heart button in product card - parent can pass mutation
  };

  const renderProductCard = ({ item }: { item: any }) => {
    const imageSource = getFirstImageSource(item.images, images.bottomList.casual);
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      >
        <View style={styles.productImageWrap}>
          <CachedImage
            source={imageSource}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => handleWishlistPress(item._id)}
          >
            <Image source={icons.heart} style={styles.heartIcon} />
          </TouchableOpacity>
        </View>
        <Text style={styles.brandName} numberOfLines={1}>{item.brand || ''}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Style</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('WishList')}
          >
            <Image source={icons.heart} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Home', { screen: 'CartStack' })}
          >
            <Image source={icons.cart} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <CachedImage
            source={images.casual}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Latest Picks for You</Text>
            <Text style={styles.bannerSubtitle}>Curated trends just for you</Text>
          </View>
        </View>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
          />
          <TouchableOpacity
            style={[styles.toggleBtn, styles.toggleBtnGrid, viewMode === 'grid' && styles.toggleBtnActive]}
            onPress={() => setViewMode('grid')}
          />
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No products in this style yet.</Text>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item._id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productList}
          />
        )}
      </ScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backBtn: { padding: 4, marginRight: 8 },
  backIcon: { width: 24, height: 24, tintColor: '#2C2C2E' },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  headerIcons: { flexDirection: 'row', gap: 12 },
  headerIconBtn: { padding: 4 },
  headerIcon: { width: 24, height: 24, tintColor: '#2C2C2E' },
  scrollContent: { paddingBottom: 100 },
  banner: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  bannerSubtitle: { fontSize: 14, color: '#EEE', marginTop: 4 },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  toggleBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  toggleBtnGrid: { backgroundColor: 'transparent' },
  toggleBtnActive: { backgroundColor: '#2C2C2E', borderColor: '#2C2C2E' },
  loadingText: { textAlign: 'center', marginTop: 24, color: '#8E8E93' },
  emptyText: { textAlign: 'center', marginTop: 24, color: '#8E8E93' },
  productList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  productRow: { justifyContent: 'space-between', marginBottom: 16 },
  productCard: { width: cardWidth },
  productImageWrap: { position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  productImage: { width: '100%', height: cardWidth * 1.2 },
  heartBtn: { position: 'absolute', top: 8, right: 8 },
  heartIcon: { width: 22, height: 22, tintColor: '#FFF' },
  brandName: { fontSize: 12, color: '#8E8E93', marginBottom: 2 },
  productName: { fontSize: 14, fontWeight: '500', color: '#2C2C2E' },
  price: { fontSize: 14, fontWeight: '600', color: '#2C2C2E', marginTop: 4 },
});

export default StyleDetailScreen;
