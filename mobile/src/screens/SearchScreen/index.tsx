import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeView, SearchFilterBar, LoadingScreen, CachedImage } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import { styles } from './styles';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { RouteProp } from '@react-navigation/native';

// API Hooks
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { getFirstImageSource } from '../../utils/imageHelper';
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
}

interface SearchScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Search'>;
  route: RouteProp<RootStackParamList, 'Search'>;
}

interface FilterState {
  brands?: string[];
  discount?: string | null;
  sortBy?: string;
  minPrice?: string; // Price range button value (e.g., '10k')
  maxPrice?: number; // Actual max price value
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { autoFocus, searchText: initialSearchText, initialCategory, initialStyle } = route.params || {};
  const [searchQuery, setSearchQuery] = useState(initialSearchText || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [selectedStyle, setSelectedStyle] = useState(initialStyle || '');
  
  // Update selected category when route params change
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  
  // Update selected style when route params change
  useEffect(() => {
    if (initialStyle) {
      setSelectedStyle(initialStyle);
    }
  }, [initialStyle]);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({});

  // Minimum characters required before triggering search (prevents searching on single characters)
  const MIN_SEARCH_LENGTH = 2;
  
  // Debounce search query to avoid too many API calls (800ms delay for better UX)
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 800);
  
  // Determine if we should search (query must be at least MIN_SEARCH_LENGTH characters)
  const shouldSearch = debouncedSearchQuery.length >= MIN_SEARCH_LENGTH;

  // Fetch categories for filter
  const { data: categoriesData } = useCategories();
  const categories = ['All', ...((categoriesData as any)?.data?.map((cat: any) => cat.name) || [])];

  // Build filter object for API - memoize to prevent unnecessary recalculations
  const apiFilters = useMemo(() => {
    const filters: any = {
      status: 'active', // Only show active products
      limit: 100, // Increase limit for search results
    };
    
    // Add search query if it meets minimum length requirement
    if (shouldSearch && debouncedSearchQuery) {
      filters.search = debouncedSearchQuery;
    }
    
    if (selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    
    // Apply style filter if provided
    if (selectedStyle) {
      filters.style = selectedStyle;
    }
    
    // Apply brand filters
    if (appliedFilters.brands && appliedFilters.brands.length > 0) {
      filters.brand = appliedFilters.brands[0]; // Backend supports single brand for now
    }
    
    // NOTE: Backend doesn't support discount or price range filters
    // These filters are applied client-side after fetching products
    
    // Apply sort
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
  }, [selectedCategory, selectedStyle, appliedFilters, shouldSearch, debouncedSearchQuery]);

  // Fetch products (with or without search based on query length)
  const { data: productsData, isLoading } = useProducts(apiFilters);
  
  // Determine which data to use
  const productsDataFinal: any = productsData;

  // Format products for display - memoize to prevent infinite loops
  const formattedProducts = useMemo(() => {
    if (!productsDataFinal?.data) {
      // If no data and user is typing but hasn't reached minimum length, return empty
      if (searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_SEARCH_LENGTH) {
        return [];
      }
      return [];
    }
    
    // Map and enrich products with calculated discount
    let products = productsDataFinal.data.map((product: any) => {
      // Calculate discount from originalPrice if discount field is missing
      let discount = product.discount || 0;
      if (!discount && product.originalPrice && product.price < product.originalPrice) {
        discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      }
      
      return {
        id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        formattedPrice: `PKR ${product.price.toLocaleString()}`,
        rating: `${product.rating.toFixed(1)} (${product.reviewCount})`,
        image: getFirstImageSource(product.images, images.image1),
        category: product.category,
        brand: product.brand || '',
        discount: discount,
      };
    });
    
    // Apply client-side filters for brand selection (multi-brand)
    if (appliedFilters.brands && appliedFilters.brands.length > 0) {
      products = products.filter((p: any) => 
        appliedFilters.brands!.some((brand) => 
          p.brand?.toLowerCase().includes(brand.toLowerCase())
        )
      );
    }
    
    // Apply discount filter (client-side since backend doesn't support it)
    if (appliedFilters.discount) {
      const minDiscount = parseInt(appliedFilters.discount);
      products = products.filter((p: any) => p.discount >= minDiscount);
    }
    
    // Apply price range filter (client-side since backend doesn't support it)
    if (appliedFilters.maxPrice) {
      products = products.filter((p: any) => p.price <= appliedFilters.maxPrice!);
    }
    
    return products;
  }, [productsDataFinal?.data, appliedFilters, searchQuery]);

  const [filteredData, setFilteredData] = useState(formattedProducts);

  // Update filtered data when products change
  useEffect(() => {
    setFilteredData(formattedProducts);
  }, [formattedProducts]);

  const renderProductItem = ({ item }: { item: Product }) => (
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
        />
        {/* Removed non-functional heart icon button */}
      </View>
      <View style={styles.productContent}>
        <View style={styles.ratingContainer}>
          <Image source={icons.star} style={styles.starIcon} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        {item.brand ? (
          <View style={styles.brandContainer}>
            <View style={styles.brandLogoPlaceholder} />
            <Text style={styles.brandName}>{item.brand}</Text>
            <Image source={icons.verify} style={styles.verifyIcon} />
          </View>
        ) : null}
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>{item.formattedPrice}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryTab = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab
      ]}
      onPress={() => {
        setSelectedCategory(category);
        // Scroll to top when category changes
        // The API will automatically refetch due to apiFilters dependency change
      }}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category && styles.selectedCategoryTabText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    const trimmedQuery = searchQuery.trim();
    
    // Show different messages based on query length
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
  };

  // Show loading screen only when actually searching (not for very short queries)
  if (isLoading && (shouldSearch || !searchQuery.trim())) {
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

      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchFilterBar
            placeholder="Search products..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={true}
            autoFocus={autoFocus}
            onApplyFilters={(filters) => {
              // Map filter values (removed productType - unused)
              const mappedFilters: FilterState = {
                brands: filters.brands,
                discount: filters.discount,
                sortBy: filters.sortBy,
                minPrice: filters.minPrice, // Price range button value (e.g., '10k')
                maxPrice: filters.maxPrice, // Actual max price value
              };
              setAppliedFilters(mappedFilters);
            }}
          />
        </View>

        {/* Results Count */}
        {!isLoading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredData.length} Results Found
              {shouldSearch && searchQuery.trim() && ` for "${searchQuery.trim()}"`}
            </Text>
          </View>
        )}

        {/* Category Tabs */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {categories.map(renderCategoryTab)}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          {filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productsList}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
};

export default SearchScreen;