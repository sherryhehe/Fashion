import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, CachedImage } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import { useBrands, useTopBrands, useFeaturedBrands } from '../../hooks/useBrands';
import { getImageSource } from '../../utils/imageHelper';

const { width } = Dimensions.get('window');
const brandSize = (width - 48) / 3 - 8;

type AllBrandsNavigationProp = StackNavigationProp<RootStackParamList, 'AllBrands'>;

interface AllBrandsScreenProps {
  navigation: AllBrandsNavigationProp;
  route?: { params?: { title?: string } };
}

const AllBrandsScreen: React.FC<AllBrandsScreenProps> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allBrandsRes } = useBrands();
  const { data: topBrandsRes } = useTopBrands(6);
  const { data: featuredBrandsRes } = useFeaturedBrands();

  const allBrands = allBrandsRes?.data || [];
  const topBrands = topBrandsRes?.data || [];
  const popularBrands = featuredBrandsRes?.data || topBrands;

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return allBrands;
    const q = searchQuery.trim().toLowerCase();
    return allBrands.filter(
      (b: any) => b.name?.toLowerCase().includes(q)
    );
  }, [allBrands, searchQuery]);

  const renderBrandItem = (item: any, itemCount?: number) => (
    <TouchableOpacity
      key={item._id}
      style={styles.brandItem}
      onPress={() => navigation.navigate('StoreDetail', { storeId: item._id })}
    >
      <View style={styles.brandCircle}>
        <CachedImage
          source={getImageSource(item.logo, images.shopLogo)}
          style={styles.brandLogo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
      {itemCount != null && (
        <Text style={styles.brandCount}>{itemCount} items</Text>
      )}
    </TouchableOpacity>
  );

  const renderBrandGrid = (data: any[], showCount = false) => (
    <View style={styles.brandGrid}>
      {data.map((b: any) => (
        <View key={b._id} style={styles.brandGridItem}>
          {renderBrandItem(b, showCount ? (b.productCount ?? 0) : undefined)}
        </View>
      ))}
    </View>
  );

  return (
    <SafeView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Brands</Text>
        <TouchableOpacity style={styles.searchIconBtn}>
          <Image source={icons.search} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.introText}>
          Explore all brands available on our platform.
        </Text>

        <View style={styles.searchWrap}>
          <Image source={icons.search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search brands, items or styles..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {searchQuery.trim() ? null : (
          <>
            {topBrands.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Brands</Text>
                {renderBrandGrid(topBrands, true)}
              </View>
            )}
            {popularBrands.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Today</Text>
                {renderBrandGrid(popularBrands, true)}
              </View>
            )}
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'All Brands'}
          </Text>
          {filteredBrands.length === 0 ? (
            <Text style={styles.emptyText}>No brands found.</Text>
          ) : (
            renderBrandGrid(filteredBrands, true)
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backBtn: { padding: 4, marginRight: 8 },
  backIcon: { width: 24, height: 24, tintColor: '#2C2C2E' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C2C2E', flex: 1, textAlign: 'center' },
  searchIconBtn: { padding: 4 },
  headerIcon: { width: 24, height: 24, tintColor: '#2C2C2E' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  introText: { fontSize: 14, color: '#8E8E93', marginTop: 12, marginBottom: 16 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: { width: 20, height: 20, marginRight: 10, tintColor: '#8E8E93' },
  searchInput: { flex: 1, fontSize: 16, color: '#2C2C2E', padding: 0 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2C2C2E', marginBottom: 12 },
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  brandGridItem: { width: '33.33%', padding: 4 },
  brandItem: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  brandCircle: {
    width: brandSize - 16,
    height: brandSize - 16,
    borderRadius: (brandSize - 16) / 2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  brandLogo: { width: '80%', height: '80%' },
  brandName: { fontSize: 12, fontWeight: '500', color: '#2C2C2E', textAlign: 'center' },
  brandCount: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingVertical: 24 },
});

export default AllBrandsScreen;
