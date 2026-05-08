import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeView, SearchFilterBar, LoadingScreen, CachedImage } from '../../components';
import { icons } from '../../assets/icons';
import { styles } from './styles';
import images from '../../assets/images';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { RouteProp } from '@react-navigation/native';

import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useStyles } from '../../hooks/useStyles';
import { useBrands } from '../../hooks/useBrands';
import { getFirstImageSource, getImageSource } from '../../utils/imageHelper';
import { useDebounce } from '../../hooks/useDebounce';

interface Product {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  rating: string;
  image: any;
  category: string;
  brand?: string;
  brandLogo?: any;
  brandVerified?: boolean;
}

interface SearchScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Search'>;
  route: RouteProp<RootStackParamList, 'Search'>;
}

interface FilterState {
  brands?: string[];
  discount?: string | null;
  sortBy?: string;
  minPrice?: string;
  maxPrice?: number;
}

const MIN_SEARCH_LENGTH = 2;

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { autoFocus, searchText: initialSearchText, initialCategory, initialStyle } = route.params || {};
  const [searchQuery, setSearchQuery] = useState(initialSearchText || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [selectedStyle, setSelectedStyle] = useState(initialStyle || '');
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialStyle) {
      setSelectedStyle(initialStyle);
    }
  }, [initialStyle]);

  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 800);
  const shouldSearch = debouncedSearchQuery.length >= MIN_SEARCH_LENGTH;
  const showStyleTabs = !!initialStyle;

  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedProducts([]);
  }, [selectedCategory, selectedStyle, appliedFilters, debouncedSearchQuery, showStyleTabs]);

  const { data: categoriesData } = useCategories();
  const categories = useMemo(
    () => ['All', ...((categoriesData as any)?.data?.map((cat: any) => cat.name) || [])],
    [categoriesData],
  );

  const { data: stylesData } = useStyles();
  const styleOptions = useMemo(
    () => ['All', ...((stylesData as any)?.data?.map((style: any) => style.name) || [])],
    [stylesData],
  );

  const { data: allBrandsData } = useBrands();
  const allBrandsArray = useMemo(() => allBrandsData?.data || [], [allBrandsData?.data]);

  const brandMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(allBrandsArray)) {
      allBrandsArray.forEach((brand: any) => {
        if (brand.name) {
          map.set(brand.name, brand);
        }
      });
    }
    return map;
  }, [allBrandsArray]);

  const filterTabs = showStyleTabs ? styleOptions : categories;
  const filterTabsScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if ((initialCategory || initialStyle) && filterTabs.length > 0 && filterTabsScrollRef.current) {
      const filterIndex = filterTabs.findIndex(filter => filter === (initialCategory || initialStyle));
      if (filterIndex > 0) {
        setTimeout(() => {
          filterTabsScrollRef.current?.scrollTo({
            x: (filterIndex - 1) * 100,
            animated: true,
          });
        }, 100);
      }
    }
  }, [initialCategory, initialStyle, filterTabs.length]);

  const apiFilters = useMemo(() => {
    const filters: any = {
      status: 'active',
      limit: 20,
      page: currentPage,
    };
    if (shouldSearch && debouncedSearchQuery) {
      filters.search = debouncedSearchQuery;
    }
    if (!showStyleTabs && selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    if (showStyleTabs) {
      if (selectedStyle && selectedStyle !== 'All' && selectedStyle !== '') {
        filters.style = selectedStyle;
      }
    } else if (selectedStyle && selectedStyle !== 'All' && selectedStyle !== '') {
      filters.style = selectedStyle;
    }
    if (appliedFilters.brands && appliedFilters.brands.length > 0) {
      filters.brand = appliedFilters.brands[0];
    }
    if (appliedFilters.sortBy) {
      switch (appliedFilters.sortBy) {
        case 'Low Price to High':
          filters.sortBy = 'price';
          filters.order = 'asc';
          break;
        case 'High to Low':
          filters.sortBy = 'price';
          filters.order = 'desc';
          break;
        case 'New Arrivals':
          filters.sortBy = 'createdAt';
          filters.order = 'desc';
          break;
      }
    }
    return filters;
  }, [selectedCategory, selectedStyle, appliedFilters, shouldSearch, debouncedSearchQuery, showStyleTabs, currentPage]);

  const { data: productsData, isLoading } = useProducts(apiFilters);

  const productsDataFinal: any = productsData;
  const pagination = productsDataFinal?.pagination;
  const hasMorePages = pagination ? currentPage < pagination.totalPages : false;

  const formattedProducts = useMemo(() => {
    if (!productsDataFinal?.data) {
      return [];
    }
    if (searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_SEARCH_LENGTH) {
      return [];
    }
    let products = productsDataFinal.data.map((product: any) => {
      let discount = product.discount || 0;
      if (!discount && product.originalPrice && product.price < product.originalPrice) {
        discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      }
      const brandName = product.brand || '';
      const brandInfo = brandName ? brandMap.get(brandName) : null;
      const brandLogo = brandInfo?.logo ? getImageSource(brandInfo.logo, images.shopLogo) : null;
      return {
        id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        formattedPrice: `PKR ${product.price.toLocaleString()}`,
        rating: `${product.rating.toFixed(1)} (${product.reviewCount})`,
        image: getFirstImageSource(product.images, images.image1),
        category: product.category,
        brand: brandName,
        brandLogo: brandLogo,
        brandVerified: brandInfo?.verified || false,
        discount: discount,
      };
    });
    if (appliedFilters.brands && appliedFilters.brands.length > 0) {
      products = products.filter((p: any) =>
        appliedFilters.brands!.some((brand) =>
          p.brand?.toLowerCase().includes(brand.toLowerCase()),
        ),
      );
    }
    if (appliedFilters.discount) {
      const minDiscount = parseInt(appliedFilters.discount);
      products = products.filter((p: any) => p.discount >= minDiscount);
    }
    if (appliedFilters.maxPrice) {
      products = products.filter((p: any) => p.price <= appliedFilters.maxPrice!);
    }
    return products;
  }, [productsDataFinal?.data, appliedFilters, searchQuery, brandMap]);

  useEffect(() => {
    if (formattedProducts.length > 0) {
      if (currentPage === 1) {
        setAccumulatedProducts(formattedProducts);
      } else {
        setAccumulatedProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = formattedProducts.filter((p: any) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      setIsLoadingMore(false);
    } else if (currentPage === 1) {
      setAccumulatedProducts([]);
    }
  }, [formattedProducts, currentPage]);

  const handleLoadMore = useCallback(() => {
    if (!hasMorePages || isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  }, [hasMorePages, isLoadingMore, isLoading]);

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      style={styles.productItem}
    >
      <View style={styles.productImageContainer}>
        <CachedImage
          source={item.image}
          style={styles.productImage}
          priority="normal"
          cache="immutable"
          resizeMode="cover"
          placeholder={images.image1}
          fallback={true}
        />
      </View>
      <View style={styles.productContent}>
        <View style={styles.ratingContainer}>
          <Image source={icons.star} style={styles.starIcon} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        {item.brand ? (
          <View style={styles.brandContainer}>
            {item.brandLogo ? (
              <Image
                source={item.brandLogo}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.brandLogoPlaceholder} />
            )}
            <Text style={styles.brandName}>{item.brand}</Text>
            {item.brandVerified && (
              <Image source={icons.verify} style={styles.verifyIcon} />
            )}
          </View>
        ) : null}
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>{item.formattedPrice}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderCategoryTab = useCallback((category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category && styles.selectedCategoryTabText,
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory]);

  const renderStyleTab = useCallback((style: string) => {
    const isSelected = showStyleTabs && (
      (style === 'All' && !selectedStyle) ||
      (style !== 'All' && selectedStyle === style)
    );
    return (
      <TouchableOpacity
        key={style}
        style={[
          styles.categoryTab,
          isSelected && styles.selectedCategoryTab,
        ]}
        onPress={() => {
          if (style === 'All') {
            setSelectedStyle('');
          } else {
            setSelectedStyle(style);
          }
        }}
      >
        <Text style={[
          styles.categoryTabText,
          isSelected && styles.selectedCategoryTabText,
        ]}>
          {style}
        </Text>
      </TouchableOpacity>
    );
  }, [showStyleTabs, selectedStyle]);

  const ListHeader = useMemo(() => (
    <View>
      <View style={styles.searchSection}>
        <SearchFilterBar
          placeholder="Search products..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          showFilters={true}
          autoFocus={autoFocus}
          onApplyFilters={(filters) => {
            const mappedFilters: FilterState = {
              brands: filters.brands,
              discount: filters.discount,
              sortBy: filters.sortBy,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
            };
            setAppliedFilters(mappedFilters);
          }}
        />
      </View>

      {!isLoading && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {accumulatedProducts.length} Results Found
            {shouldSearch && searchQuery.trim() && ` for "${searchQuery.trim()}"`}
          </Text>
        </View>
      )}

      <View style={styles.categoryContainer}>
        <ScrollView
          ref={filterTabsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {showStyleTabs
            ? filterTabs.map(renderStyleTab)
            : filterTabs.map(renderCategoryTab)
          }
        </ScrollView>
      </View>
    </View>
  ), [
    searchQuery, autoFocus, isLoading, accumulatedProducts.length,
    shouldSearch, showStyleTabs, filterTabs, renderStyleTab, renderCategoryTab,
  ]);

  const ListFooter = useMemo(() => {
    if (!hasMorePages || accumulatedProducts.length === 0) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.loadMoreText}>Load More</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }, [hasMorePages, accumulatedProducts.length, handleLoadMore, isLoadingMore]);

  const ListEmpty = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length > 0 && trimmedQuery.length < MIN_SEARCH_LENGTH) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Type at least {MIN_SEARCH_LENGTH} characters to search
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Keep typing to find products
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>
          {trimmedQuery ? `No results found for "${trimmedQuery}"` : 'No products available'}
        </Text>
        <Text style={styles.emptyStateSubtext}>
          Try adjusting your search or filters
        </Text>
      </View>
    );
  }, [searchQuery]);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const columnWrapperStyle = useMemo(() => [styles.productRow, { paddingHorizontal: 20 }], []);

  if (isLoading && (shouldSearch || !searchQuery.trim()) && accumulatedProducts.length === 0) {
    return <LoadingScreen message={shouldSearch ? "Searching products..." : "Loading products..."} variant="full" />;
  }

  return (
    <SafeView>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {route.params.headerText || "Search"}
        </Text>
      </View>

      <FlatList
        data={accumulatedProducts}
        renderItem={renderProductItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={columnWrapperStyle}
        contentContainerStyle={[styles.scrollView, styles.productsList]}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
      />
    </SafeView>
  );
};

export default SearchScreen;
