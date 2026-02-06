import React, { useState, useEffect, useMemo, useRef } from 'react';
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

// API Hooks
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Reset pagination when filters/search change
  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedProducts([]);
  }, [selectedCategory, selectedStyle, appliedFilters, debouncedSearchQuery, showStyleTabs]);

  // Minimum characters required before triggering search (prevents searching on single characters)
  const MIN_SEARCH_LENGTH = 2;
  
  // Debounce search query to avoid too many API calls (800ms delay for better UX)
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 800);
  
  // Determine if we should search (query must be at least MIN_SEARCH_LENGTH characters)
  const shouldSearch = debouncedSearchQuery.length >= MIN_SEARCH_LENGTH;

  // Fetch categories for filter
  const { data: categoriesData } = useCategories();
  const categories = ['All', ...((categoriesData as any)?.data?.map((cat: any) => cat.name) || [])];
  
  // Fetch styles for filter (when filtering by style)
  const { data: stylesData } = useStyles();
  const styleOptions = ['All', ...((stylesData as any)?.data?.map((style: any) => style.name) || [])];
  
  // Fetch all brands to get brand logos
  const { data: allBrandsData } = useBrands();
  const allBrandsArray = allBrandsData?.data || [];
  
  // Create a map of brand name -> brand object for quick lookup
  const brandMap = React.useMemo(() => {
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
  
  // Determine if we should show style tabs or category tabs
  const showStyleTabs = !!initialStyle;
  const filterTabs = showStyleTabs ? styleOptions : categories;
  const selectedFilter = showStyleTabs ? selectedStyle : selectedCategory;
  
  // Ref for filter tabs ScrollView to auto-scroll to selected filter
  const filterTabsScrollRef = useRef<ScrollView>(null);
  
  // Auto-scroll to selected filter when initialCategory or initialStyle is provided and filters are loaded
  useEffect(() => {
    if ((initialCategory || initialStyle) && filterTabs.length > 0 && filterTabsScrollRef.current) {
      const filterIndex = filterTabs.findIndex(filter => filter === (initialCategory || initialStyle));
      if (filterIndex > 0) {
        // Small delay to ensure ScrollView is rendered
        setTimeout(() => {
          filterTabsScrollRef.current?.scrollTo({
            x: (filterIndex - 1) * 100, // Approximate width per tab (adjust as needed)
            animated: true,
          });
        }, 100);
      }
    }
  }, [initialCategory, initialStyle, filterTabs.length]);

  // Build filter object for API - memoize to prevent unnecessary recalculations
  const apiFilters = useMemo(() => {
    const filters: any = {
      status: 'active', // Only show active products
      limit: 20, // Products per page
      page: currentPage,
    };
    
    // Add search query if it meets minimum length requirement
    if (shouldSearch && debouncedSearchQuery) {
      filters.search = debouncedSearchQuery;
    }
    
    // Apply category filter if not showing style tabs
    if (!showStyleTabs && selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    
    // Apply style filter if showing style tabs
    if (showStyleTabs) {
      // Only apply style filter if a specific style is selected (not "All" or empty)
      if (selectedStyle && selectedStyle !== 'All' && selectedStyle !== '') {
        filters.style = selectedStyle;
      }
    } else if (selectedStyle && selectedStyle !== 'All' && selectedStyle !== '') {
      // If not showing style tabs but style is selected (from other filters), still apply it
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
  }, [selectedCategory, selectedStyle, appliedFilters, shouldSearch, debouncedSearchQuery, showStyleTabs, currentPage]);

  // Fetch products (with or without search based on query length)
  const { data: productsData, isLoading, refetch } = useProducts(apiFilters);
  
  // Determine which data to use
  const productsDataFinal: any = productsData;
  const pagination = productsDataFinal?.pagination;
  const hasMorePages = pagination ? currentPage < pagination.totalPages : false;

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
      
      // Get brand info from brandMap
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
        brandLogo: brandLogo, // Include brand logo if available
        brandVerified: brandInfo?.verified || false, // Include verified status
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
  }, [productsDataFinal?.data, appliedFilters, searchQuery, brandMap]);

  // Accumulate products when new page data arrives
  useEffect(() => {
    if (formattedProducts.length > 0) {
      if (currentPage === 1) {
        // First page - replace accumulated products
        setAccumulatedProducts(formattedProducts);
      } else {
        // Subsequent pages - append to accumulated products
        setAccumulatedProducts(prev => {
          // Avoid duplicates by checking product IDs
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = formattedProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      setIsLoadingMore(false);
    } else if (currentPage === 1) {
      // No products on first page - clear accumulated
      setAccumulatedProducts([]);
    }
  }, [formattedProducts, currentPage]);

  const [filteredData, setFilteredData] = useState(accumulatedProducts);

  // Update filtered data when accumulated products change
  useEffect(() => {
    setFilteredData(accumulatedProducts);
  }, [accumulatedProducts]);

  // Handle load more
  const handleLoadMore = async () => {
    if (!hasMorePages || isLoadingMore || isLoading) return;
    
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  };

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

  const renderStyleTab = (style: string) => {
    // When showing style tabs, check if this style is selected
    // If "All" is selected, selectedStyle should be empty
    const isSelected = showStyleTabs && (
      (style === 'All' && !selectedStyle) || 
      (style !== 'All' && selectedStyle === style)
    );
    return (
      <TouchableOpacity
        key={style}
        style={[
          styles.categoryTab,
          isSelected && styles.selectedCategoryTab
        ]}
        onPress={() => {
          // If "All" is selected, clear the style filter
          if (style === 'All') {
            setSelectedStyle('');
          } else {
            setSelectedStyle(style);
          }
          // Scroll to top when style changes
          // The API will automatically refetch due to apiFilters dependency change
        }}
      >
        <Text style={[
          styles.categoryTabText,
          isSelected && styles.selectedCategoryTabText
        ]}>
          {style}
        </Text>
      </TouchableOpacity>
    );
  };

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

        {/* Filter Tabs (Categories or Styles) */}
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

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          {filteredData.length > 0 ? (
            <>
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
              {hasMorePages && (
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
              )}
            </>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
};

export default SearchScreen;