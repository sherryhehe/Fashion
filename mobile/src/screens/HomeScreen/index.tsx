import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CachedImage } from '../../components';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/HomeNavigator';
import { CategoryBg, SafeView, SearchFilterBar, ShimmerCategoryItem, ShimmerProductCard, ShimmerBrandItem, ShimmerHorizontalList, ShimmerGrid } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import useStyles from './styles';

// API Hooks
import { useCategories } from '../../hooks/useCategories';
import { useFeaturedProducts, useRecommendedProducts, useRandomProducts, useRecentlyAddedProducts, usePersonalizedProducts, useInfiniteProducts } from '../../hooks/useProducts';
import { useTopBrands, useFeaturedBrands, useBrands } from '../../hooks/useBrands';
import { useAddToWishlist, useRemoveFromWishlist, useIsInWishlist, useWishlist } from '../../hooks/useWishlist';
import { requireAuthOrPromptLogin } from '../../utils/guestHelper';
import { useFeaturedStyles, usePopularStyles } from '../../hooks/useStyles';
import { useBanners } from '../../hooks/useBanners';
import { useHomeCategoriesForApp } from '../../hooks/useHomeCategories';
import { getFirstImageSource, getImageSource, preloadImages, getImageUrl } from '../../utils/imageHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

const { width: screenWidth } = Dimensions.get('window');

/** Shuffle array so product order varies each time (e.g. on app open / data load). Works on both Android and iOS. */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const styles = useStyles()
  const queryClient = useQueryClient();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get user name and auth token from AsyncStorage (for personalization)
  useEffect(() => {
    const loadUserAndToken = async () => {
      try {
        const [userStr, token] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.name || null);
        }
        setHasToken(!!token);
      } catch (error) {
        console.log('Error loading user:', error);
      }
    };
    loadUserAndToken();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // API Hooks - MUST be called before using the data
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { data: featuredProductsData, isLoading: featuredLoading, refetch: refetchFeatured } = useFeaturedProducts(8);
  const { data: recommendedProductsData, isLoading: recommendedLoading, refetch: refetchRecommended } = useRecommendedProducts(10);
  const [focusShuffleKey, setFocusShuffleKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusShuffleKey((k) => k + 1);
    }, [])
  );
  const { data: randomProductsData, isLoading: randomLoading } = useRandomProducts(10, focusShuffleKey);
  const { data: personalizedProductsData, isLoading: personalizedLoading } = usePersonalizedProducts(10, hasToken);
  const { data: recentlyAddedData, isLoading: recentlyAddedLoading, refetch: refetchRecentlyAdded } = useRecentlyAddedProducts(8);
  const { data: topBrandsData, isLoading: topBrandsLoading, refetch: refetchTopBrands } = useTopBrands();
  const { data: featuredStylesData, isLoading: featuredStylesLoading, refetch: refetchStyles } = useFeaturedStyles();
  const {
    data: infiniteProductsData,
    isLoading: allProductsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchAllProducts,
  } = useInfiniteProducts({ status: 'active' });
  const { data: bannersData, isLoading: bannersLoading, refetch: refetchBanners } = useBanners('homepage', 'active');
  const { data: brandBannersData } = useBanners('homepage_brand', 'active');
  const { data: allBrandsData, refetch: refetchAllBrands } = useBrands(); // Fetch all brands to get logos
  const { data: homeCategoriesData } = useHomeCategoriesForApp();
  
  // Wishlist mutations and data
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist(); // Subscribe to wishlist changes for immediate UI updates

  // Map API data arrays - now safe to use after API hooks
  const bannersArray = bannersData?.data || [];
  const brandBannersArray = brandBannersData?.data || [];
  const categoriesArray = categoriesData?.data || [];
  const stylesArray = featuredStylesData?.data || [];
  const recommendedArray = recommendedProductsData?.data || [];
  const personalizedArray = personalizedProductsData?.data || [];
  // For "Recommended for You": when logged in use personalized; else use random products (new set each time user opens home)
  const randomArray = randomProductsData?.data || [];
  const recommendedSourceArray = (hasToken && Array.isArray(personalizedArray) && personalizedArray.length > 0)
    ? personalizedArray
    : (Array.isArray(randomArray) && randomArray.length > 0 ? randomArray : recommendedArray);
  const topBrandsArray = topBrandsData?.data || [];
  const allProductsArray = infiniteProductsData?.pages?.flatMap((p: any) => p?.data ?? []) ?? [];
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

  // Debug logs only in development to avoid home screen lag
  useEffect(() => {
    if (__DEV__ && bannersArray.length > 0) {
      console.log('🏠 HomeScreen - Banners fetched:', bannersArray.length);
    }
  }, [bannersArray.length]);

  // Preload images with priority: above-the-fold first, then below-the-fold
  useEffect(() => {
    const preloadPriorityImages = async () => {
      const priorityUrls: string[] = [];

      // Priority 1: Banner images (most visible)
      bannersArray.forEach(banner => {
        if (banner.imageUrl || banner.image) {
          const url = getImageUrl(banner.imageUrl || banner.image);
          if (url) priorityUrls.push(url);
        }
      });

      // Priority 2: Category images (above the fold)
      categoriesArray.forEach(category => {
        if (category.image) {
          const url = getImageUrl(category.image);
          if (url) priorityUrls.push(url);
        }
      });

      // Priority 3: Style images
      stylesArray.forEach(style => {
        if (style.image) {
          const url = getImageUrl(style.image);
          if (url) priorityUrls.push(url);
        }
      });

      // Priority 4: Recommended product images
      recommendedSourceArray.forEach(product => {
        if (product.images && product.images.length > 0) {
          const url = getImageUrl(product.images[0]);
          if (url) priorityUrls.push(url);
        }
      });

      // Priority 5: Brand images
      topBrandsArray.forEach(brand => {
        if (brand.logo) {
          const url = getImageUrl(brand.logo);
          if (url) priorityUrls.push(url);
        }
      });

      if (priorityUrls.length > 0) {
        if (__DEV__) console.log(`🚀 Preloading ${priorityUrls.length} priority images...`);
        preloadImages(priorityUrls).then(() => {
          if (__DEV__) console.log('✅ Priority image preloading completed');
        }).catch(() => {});
      }
    };

    const preloadBelowFoldImages = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const belowFoldUrls: string[] = [];
      allProductsArray.slice(0, 10).forEach(product => {
        if (product.images && product.images.length > 0) {
          const url = getImageUrl(product.images[0]);
          if (url) belowFoldUrls.push(url);
        }
      });
      if (belowFoldUrls.length > 0) {
        preloadImages(belowFoldUrls).catch(() => {});
      }
    };

    // Defer preload to next tick so first paint isn't blocked (reduces home lag)
    const t = setTimeout(() => {
      if (
        !categoriesLoading &&
        !featuredStylesLoading &&
        !recommendedLoading &&
        !topBrandsLoading &&
        !bannersLoading &&
        (bannersArray.length > 0 || categoriesArray.length > 0)
      ) {
        preloadPriorityImages();
      }
      if (!allProductsLoading && allProductsArray.length > 0) {
        preloadBelowFoldImages();
      }
    }, 50);

    return () => clearTimeout(t);
  }, [
    bannersArray,
    categoriesArray,
    stylesArray,
    recommendedSourceArray,
    topBrandsArray,
    allProductsArray,
    categoriesLoading,
    featuredStylesLoading,
    recommendedLoading,
    topBrandsLoading,
    allProductsLoading,
    bannersLoading,
  ]);
  // Brand banners (swipable, Shop Now → brand page) - same visual style as main hero
  const brandCarouselData = (Array.isArray(brandBannersArray) ? brandBannersArray : [])
    .sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))
    .map((banner: any, index: number) => ({
      id: banner.id || banner._id || `brand-banner-${index}`,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: getImageSource(banner.imageUrl || banner.image, images.homesliderimage),
      linkUrl: banner.linkUrl || banner.link,
    }));

  // Sort banners by order if available, then map to carousel data
  const carouselData = bannersArray.length > 0
    ? bannersArray
        .sort((a, b) => {
          // Sort by order field if available (lower order = appears first)
          const orderA = a.order ?? 999;
          const orderB = b.order ?? 999;
          return orderA - orderB;
        })
        .map((banner, index) => ({
          id: banner.id || banner._id || `banner-${index}`,
          title: banner.title || '', // Use empty string if no title
          subtitle: banner.subtitle || '', // Use empty string if no subtitle
          cta: banner.subtitle || '', // Use subtitle as CTA, or empty if no subtitle
          // Backend returns imageUrl, not image - map it correctly
          image: getImageSource(banner.imageUrl || banner.image, images.homesliderimage),
          // Backend returns linkUrl, not link - map it correctly
          link: banner.linkUrl || banner.link,
        }))
    : [];

  useEffect(() => {
    if (__DEV__ && carouselData.length > 0) {
      console.log('🎠 Carousel data prepared:', carouselData.length, 'items');
    }
  }, [carouselData.length]);

  const renderCarouselItem = ({ item }: { item: any }) => {
    const imageSource = typeof item.image === 'object' && item.image?.uri 
      ? item.image 
      : images.homesliderimage;
    
    return (
      <TouchableOpacity 
        style={[styles.heroImageContainer, { width: screenWidth }]}
        activeOpacity={item.link ? 0.8 : 1}
        onPress={() => {
          if (item.link) {
            // Handle banner link navigation if needed
            console.log('Banner link:', item.link);
          }
        }}
      >
        <CachedImage
          source={imageSource}
          style={styles.heroImage}
          resizeMode="cover"
          priority="high"
          cache="immutable"
        />
        
      </TouchableOpacity>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentSlide(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Auto-scroll carousel for multiple banners
  useEffect(() => {
    if (carouselData.length <= 1 || !isAutoScrolling) {
      return;
    }

    // Auto-scroll every 5 seconds
    autoScrollTimerRef.current = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % carouselData.length;
        try {
          flatListRef.current?.scrollToIndex({
            index: nextSlide,
            animated: true,
          });
        } catch (error) {
          // Fallback to scrollToOffset if scrollToIndex fails
          flatListRef.current?.scrollToOffset({
            offset: nextSlide * screenWidth,
            animated: true,
          });
        }
        return nextSlide;
      });
    }, 5000);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [carouselData.length, isAutoScrolling]);

  // Reset auto-scroll when user manually scrolls
  const handleScrollBeginDrag = () => {
    setIsAutoScrolling(false);
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
  };

  const handleScrollEndDrag = () => {
    // Resume auto-scroll after 8 seconds of inactivity
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 8000);
  };

  // Map API categories to display format - use actual images from API
  // Show ALL categories (no limit)
  const displayCategories = Array.isArray(categoriesArray) && categoriesArray.length > 0
    ? categoriesArray.map(category => ({
        id: category._id,
        name: category.name,
        // Use actual image from API, fallback to icon if no image
        image: category.image ? getImageSource(category.image) : null,
        icon: category.image ? null : (() => {
          // Fallback to icon mapping only if no image from API
          const name = category.name.toLowerCase();
          if (name.includes('accessor')) return icons.accessories;
          if (name.includes('bag')) return icons.bags;
          if (name.includes('shoe')) return icons.shoes;
          if (name.includes('makeup') || name.includes('beauty')) return icons.makeup;
          if (name.includes('cloth') || name.includes('dress') || name.includes('shirt')) return icons.clothes;
          return icons.clothes;
        })(),
      }))
    : [];

  // Map API styles to display format - use actual images from API
  // Show ALL styles (no limit)
  const displayStyles = Array.isArray(stylesArray) && stylesArray.length > 0
    ? stylesArray.map(style => {
        // Check if style has a valid image (not null, undefined, or empty string)
        const hasImage = style.image && typeof style.image === 'string' && style.image.trim() !== '';
        const imageSource = hasImage 
          ? getImageSource(style.image, images.casual)
          : (() => {
              // Fallback to name-based mapping only if no image from API
              const name = style.name.toLowerCase();
              if (name.includes('casual')) return images.casual;
              if (name.includes('desi') || name.includes('traditional')) return images.desi;
              if (name.includes('street') || name.includes('urban')) return images.streetwear;
              return images.casual;
            })();
        
        // Debug logging for style images
        if (__DEV__) {
          console.log(`🎨 Style: ${style.name}`, {
            hasImage,
            imagePath: style.image,
            imageSource: imageSource,
          });
        }
        
        return {
          id: style._id,
          name: style.name,
          image: imageSource,
        };
      })
    : [];

  // Format recommended products data
  const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;
  const formatRating = (rating: number, reviewCount: number) => `${rating.toFixed(1)} (${reviewCount})`;

  // Recommended products: shuffle so order varies each time user opens/focuses home
  const displayRecommendedProducts = useMemo(() => {
    if (!Array.isArray(recommendedSourceArray) || recommendedSourceArray.length === 0) return [];
    return shuffleArray(recommendedSourceArray).map(product => ({
      id: product._id,
      name: product.name,
      brand: product.brand || '',
      price: formatPrice(product.price),
      rating: formatRating(product.rating ?? 0, product.reviewCount ?? 0),
      image: getFirstImageSource(product.images, images.velvetShawl),
    }));
  }, [recommendedSourceArray, focusShuffleKey]);

  // Check if top brands data exists and is an array
  // Show ALL brands (no limit)
  const displayTopBrands = Array.isArray(topBrandsArray) && topBrandsArray.length > 0
    ? topBrandsArray.map(brand => {
        // Ensure we have a valid logo - check for null, undefined, or empty string
        const brandLogo = brand.logo && brand.logo.trim() ? brand.logo : null;
        const brandImage = getImageSource(brandLogo, images.khussakraft);
        
        return {
          id: brand._id,
          name: brand.name,
          description: brand.description || '', // Use empty string if no description
          rating: formatRating(brand.rating || 0, brand.reviewCount || 0), // Use actual rating from API
          image: brandImage || images.khussakraft, // Ensure we always have a fallback
          storeName: brand.name,
          storeType: brand.businessInfo?.businessType || '', // Use business type from API, or empty
          bannerImage: brand.banner ? getImageSource(brand.banner, images.shopBanner) : images.shopBanner,
          logoImage: getImageSource(brandLogo, images.shopLogo) || images.shopLogo,
        };
      })
    : [];

  // Featured products: shuffle so order varies each time user opens/focuses home
  const featuredArray = featuredProductsData?.data || [];
  const displayFeaturedProducts = useMemo(() => {
    if (!Array.isArray(featuredArray) || featuredArray.length === 0) return [];
    return shuffleArray(featuredArray).map(product => ({
      id: product._id,
      name: product.name,
      brand: product.brand || '',
      price: formatPrice(product.price),
      rating: formatRating(product.rating ?? 0, product.reviewCount ?? 0),
      image: getFirstImageSource(product.images, images.silkDupatta),
    }));
  }, [featuredArray, focusShuffleKey]);

  // Custom home categories (from admin) - each has name + products
  const homeCategoriesArray = homeCategoriesData?.data || [];

  // Recently added products: shuffle so order varies each time user opens/focuses home
  const recentlyAddedArray = recentlyAddedData?.data || [];
  const displayRecentlyAddedProducts = useMemo(() => {
    if (!Array.isArray(recentlyAddedArray) || recentlyAddedArray.length === 0) return [];
    return shuffleArray(recentlyAddedArray).map(product => ({
      id: product._id,
      name: product.name,
      brand: product.brand || '',
      price: formatPrice(product.price),
      rating: formatRating(product.rating ?? 0, product.reviewCount ?? 0),
      image: getFirstImageSource(product.images, images.minicrossbody),
    }));
  }, [recentlyAddedArray, focusShuffleKey]);

  // Bottom grid products: sorted by recently added (infinite scroll); no shuffle so load-more is consistent
  const displayBottomGridProducts = useMemo(() => {
    if (!Array.isArray(allProductsArray) || allProductsArray.length === 0) return [];
    return allProductsArray.map((product: any) => {
      const brandName = product.brand || '';
      const brandInfo = brandName ? brandMap.get(brandName) : null;
      const brandLogo = brandInfo?.logo ? getImageSource(brandInfo.logo, images.shopLogo) : null;
      return {
        id: product._id,
        name: product.name,
        brand: brandName,
        brandLogo: brandLogo,
        brandVerified: brandInfo?.verified || false,
        price: formatPrice(product.price),
        rating: formatRating(product.rating, product.reviewCount),
        image: getFirstImageSource(product.images, images.bottomList.image1),
      };
    });
  }, [allProductsArray, brandMap]);

  const handleScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const padding = 400;
    const nearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - padding;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Navigation handlers for "See More" buttons
  const handleSeeMoreCategories = () => {
    // categoriesArray already contains ALL categories from useCategories()
    const allCategories = categoriesArray.map((cat: any) => ({
      _id: cat._id || cat.id,
      id: cat._id || cat.id,
      name: cat.name,
      image: cat.image,
    }));
    
    navigation.getParent()?.navigate('CategoryList', {
      title: 'All Categories',
      data: allCategories,
      listType: 'category',
      numColumns: 4,
      showSearch: true,
      headerText: 'All Categories',
      searchPlaceholder: 'Search categories...',
    });
  };

  const handleSeeMoreStyles = () => {
    // stylesArray contains featured styles - use what we have
    const allStyles = stylesArray.map((style: any) => ({
      _id: style._id || style.id,
      id: style._id || style.id,
      name: style.name,
      image: style.image,
    }));
    
    navigation.getParent()?.navigate('CategoryList', {
      title: 'All Styles',
      data: allStyles,
      listType: 'style',
      numColumns: 2,
      showSearch: true,
      headerText: 'All Styles',
      searchPlaceholder: 'Search styles...',
    });
  };

  const handleSeeMoreBrands = () => {
    // topBrandsArray contains top brands - use what we have
    const allBrands = topBrandsArray.map((brand: any) => ({
      _id: brand._id || brand.id,
      id: brand._id || brand.id,
      name: brand.name,
      description: brand.description || '',
      rating: brand.rating || 0,
      reviewCount: brand.reviewCount || 0,
      logo: brand.logo,
      banner: brand.banner,
      businessInfo: brand.businessInfo,
    }));
    
    navigation.getParent()?.navigate('CategoryList', {
      title: 'All Brands',
      data: allBrands,
      listType: 'brand',
      numColumns: 2,
      showSearch: true,
      headerText: 'All Brands',
      searchPlaceholder: 'Search brands...',
    });
  };

  const handleSeeMoreRecommended = () => {
    navigation.getParent()?.navigate('Search', {
      autoFocus: false,
      headerText: 'Recommended Products',
      searchPlaceholder: 'Search recommended products...',
    });
  };

  const handleSeeMoreFeatured = () => {
    navigation.getParent()?.navigate('Search', {
      autoFocus: false,
      headerText: 'Featured Products',
      searchPlaceholder: 'Search featured products...',
    });
  };

  const handleSeeMoreRecentlyAdded = () => {
    navigation.getParent()?.navigate('Search', {
      autoFocus: false,
      headerText: 'Recently Added',
      searchPlaceholder: 'Search recently added products...',
    });
  };

  const renderCategoryItem = ({ item, index }: { item: any, index: number }) => {
    // Use image from API if available, otherwise use icon fallback
    const imageSource = item.image || item.icon || icons.clothes;
    
    return (
      <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Search',{
        autoFocus: false,
        headerText: item.name,
        initialCategory: item.name, // Pass category name to pre-select it in SearchScreen
      })} style={styles.categoryItem}>
        <CategoryBg size={80}>
          {item.image ? (
            <CachedImage source={imageSource} style={[styles.categoryIcon,{width: index === 4 ? 35 : 60}]} priority="high" cache="immutable" />
          ) : (
            <Image source={item.icon || icons.clothes} style={[styles.categoryIcon,{width: index === 4 ? 35 : 60}]} />
          )}
        </CategoryBg>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderStyleItem = ({ item }: { item: any }) => {
    // Ensure we have a valid image source - use fallback if image is null/undefined
    const imageSource = item.image || images.casual;
    const fallbackImage = images.casual;
    
    return (
      <TouchableOpacity 
        onPress={() => navigation.getParent()?.navigate('StyleDetail', { styleName: item.name })} 
        style={styles.styleItem}
      >
        <CachedImage 
          source={imageSource} 
          style={styles.styleImage} 
          priority="high" 
          cache="immutable"
          placeholder={fallbackImage}
          fallback={true}
          onError={(error) => {
            if (__DEV__) {
              console.log(`❌ Style image failed to load for "${item.name}":`, {
                error,
                imageSource,
                itemImage: item.image,
              });
            }
          }}
        />
        <Text style={styles.styleName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderRecommendedItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.recommendedItem}
      onPress={() => navigation.getParent()?.navigate('ProductDetail', { productId: item.id })}
    >
      <CachedImage source={item.image} style={styles.recommendedImage} priority="high" cache="immutable" />
      <View style={styles.recommendedContent}>
        {item.brand ? <Text style={styles.brandLogo}>{item.brand}</Text> : null}
        <Text style={styles.recommendedPrice}>{item.price}</Text>
        <View style={styles.nameAndRatingContainer}>
          <Text style={styles.recommendedName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Image source={icons.star} style={styles.starIcon} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBrandItem = ({ item }: { item: any }) => {
    // Ensure we have a valid image source - handle both URI objects and require() statements
    const imageSource = item.image || images.khussakraft;
    
    return (
      <TouchableOpacity
        style={styles.brandItem}
        onPress={() => navigation.getParent()?.navigate('StoreDetail', { storeId: item.id })}
      >
        <View style={styles.brandImageContainer}>
          <CachedImage 
            source={imageSource} 
            style={styles.brandImage}
            priority="high"
            cache="immutable"
            onError={() => {
              // If image fails to load, it will show nothing - this is handled by the fallback
              console.log('Brand image failed to load for:', item.name);
            }}
          />
        </View>
        <View style={styles.brandContent}>
          <View style={styles.brandRatingContainer}>
            <Image source={icons.star} style={styles.brandStarIcon} />
            <Text style={styles.brandRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {item.description ? (
            <Text 
              style={styles.brandDescription} 
              numberOfLines={2} 
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // Handle wishlist toggle for product cards
  const handleWishlistToggle = async (productId: string, isInWishlist: boolean) => {
    const canProceed = await requireAuthOrPromptLogin(
      'add items to wishlist',
      navigation.getParent() // Pass parent navigator to access root Auth screen
    );

    if (!canProceed) return;

    try {
      if (isInWishlist) {
        await removeFromWishlistMutation.mutateAsync(productId);
      } else {
        await addToWishlistMutation.mutateAsync({ productId });
      }
    } catch (error) {
      console.log('Wishlist toggle error:', error);
    }
  };

  const renderBottomGridItem = ({ item }: { item: any }) => {
    const wishlistLoading = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;
    // Use wishlistData from hook to ensure component re-renders when wishlist changes
    const isInWishlist = wishlistData?.data?.some((w: any) => w.productId === item.id || w.product?._id === item.id) || false;

    return (
      <TouchableOpacity
        style={styles.bottomGridItem}
        onPress={() => navigation.getParent()?.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.bottomImageContainer}>
          <CachedImage 
            source={item.image} 
            style={styles.bottomImage} 
            priority="low"
            cache="immutable"
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.cartIconContainer}
            onPress={(e) => {
              e.stopPropagation();
              handleWishlistToggle(item.id, isInWishlist);
            }}
            disabled={wishlistLoading}
          >
            <Image 
              source={isInWishlist ? icons.headrtFilled : icons.heart} 
              style={styles.cartIcon} 
              tintColor={isInWishlist ? '#FF3B30' : '#FFFFFF'} 
            />
          </TouchableOpacity>
        </View>
      <View style={styles.bottomContent}>
        <View style={styles.bottomRatingContainer}>
          <Image source={icons.star} style={styles.bottomStarIcon} />
          <Text style={styles.bottomRatingText}>{item.rating}</Text>
        </View>
        {item.brand ? (
          <View style={styles.bottomBrandContainer}>
            {item.brandLogo ? (
              <Image 
                source={item.brandLogo} 
                style={styles.bottomBrandLogo} 
                resizeMode="contain"
              />
            ) : (
              <View style={styles.brandLogoPlaceholder} />
            )}
            <Text style={styles.bottomBrandName}>{item.brand}</Text>
            {item.brandVerified && (
              <Image source={icons.verify} style={styles.verifyIcon} />
            )}
          </View>
        ) : null}
        <Text style={styles.bottomProductName}>{item.name}</Text>
        <Text style={styles.bottomPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
    );
  };

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch all queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['brands'] }),
        queryClient.invalidateQueries({ queryKey: ['styles'] }),
        queryClient.invalidateQueries({ queryKey: ['banners'] }),
        queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
        // Refetch all data
        refetchCategories(),
        refetchFeatured(),
        refetchRecommended(),
        refetchRecentlyAdded(),
        refetchTopBrands(),
        refetchStyles(),
        refetchAllProducts(),
        refetchBanners(),
        refetchAllBrands(),
        queryClient.invalidateQueries({ queryKey: ['home-categories'] }),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, refetchCategories, refetchFeatured, refetchRecommended, refetchRecentlyAdded, refetchTopBrands, refetchStyles, refetchAllProducts, refetchBanners, refetchAllBrands]);

  return (
    <SafeView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton}>
            <Image source={icons.menubar} style={styles.menuIcon} />
          </TouchableOpacity>
          <Text style={styles.logoText}>SHOPO</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => {
              // Navigate to Cart tab in the Tab Navigator
              // HomeScreen is in HomeStack, so getParent() gives us the Tab Navigator
              const tabNavigator = navigation.getParent();
              if (tabNavigator) {
                tabNavigator.navigate('CartStack');
              }
            }}
          >
            <Image source={icons.cart} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Top Header Section */}


        {/* Greeting and Search Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {userName ? `${getGreeting()}, ${userName} 👋` : `${getGreeting()} 👋`}
          </Text>
          <SearchFilterBar
            placeholder="Search brands, items or styles..."
            isNavigational={true}
            showFilters={false}
            showFilterButton={true}
          />
        </View>

        {/* Hero Banner Section - Full Width Carousel */}
        {bannersLoading ? (
          <View style={styles.heroSection}>
            <View style={{ width: screenWidth, height: 200, backgroundColor: '#F2F2F7', borderRadius: 12 }} />
          </View>
        ) : carouselData.length > 0 ? (
          <View style={styles.heroSection}>
            <FlatList
              ref={flatListRef}
              data={carouselData}
              renderItem={renderCarouselItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onScrollBeginDrag={handleScrollBeginDrag}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                if (index >= 0 && index < carouselData.length) {
                  setCurrentSlide(index);
                }
              }}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              style={styles.carousel}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="start"
              scrollEventThrottle={16}
              removeClippedSubviews={false}
            />
            {carouselData.length > 1 && (
              <View style={styles.carouselIndicators}>
                {carouselData.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentSlide && styles.activeIndicator
                    ]}
                    onPress={() => {
                      setIsAutoScrolling(false);
                      setCurrentSlide(index);
                      try {
                        flatListRef.current?.scrollToIndex({ 
                          index, 
                          animated: true 
                        });
                      } catch (error) {
                        // Fallback to scrollToOffset if scrollToIndex fails
                        flatListRef.current?.scrollToOffset({
                          offset: index * screenWidth,
                          animated: true,
                        });
                      }
                      // Resume auto-scroll after manual navigation
                      setTimeout(() => {
                        setIsAutoScrolling(true);
                      }, 8000);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.heroSection}>
            <View style={{ width: screenWidth, height: 200, backgroundColor: '#F2F2F7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#8E8E93', fontSize: 14 }}>No banners available</Text>
            </View>
          </View>
        )}

        {/* Brand Banners (swipable, Shop Now → brand page) */}
        {brandCarouselData.length > 0 && (
          <View style={[styles.heroSection, { marginTop: 16 }]}>
            <FlatList
              data={brandCarouselData}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              snapToInterval={screenWidth}
              snapToAlignment="start"
              decelerationRate="fast"
              renderItem={({ item }: { item: any }) => {
                const imageSource = typeof item.image === 'object' && item.image?.uri ? item.image : images.homesliderimage;
                const storeId = item.linkUrl?.trim?.();
                return (
                  <TouchableOpacity
                    style={[styles.heroImageContainer, { width: screenWidth }]}
                    activeOpacity={1}
                    onPress={() => {
                      if (storeId) navigation.getParent()?.navigate('StoreDetail', { storeId });
                    }}
                  >
                    <CachedImage source={imageSource} style={styles.heroImage} resizeMode="cover" />
                    <View style={styles.brandBannerOverlay}>
                      {item.title ? <Text style={styles.brandBannerTitle}>{item.title}</Text> : null}
                      {item.subtitle ? <Text style={styles.brandBannerSubtitle}>{item.subtitle}</Text> : null}
                      {storeId ? (
                        <TouchableOpacity
                          style={styles.brandBannerCta}
                          onPress={() => navigation.getParent()?.navigate('StoreDetail', { storeId })}
                        >
                          <Text style={styles.brandBannerCtaText}>Shop Now</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Browse by Category Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
          </View>
          {categoriesLoading ? (
            <View style={styles.horizontalList}>
              <FlatList
                data={[1, 2, 3, 4, 5]}
                renderItem={() => <ShimmerCategoryItem />}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>
          ) : displayCategories.length > 0 ? (
            <FlatList
              data={displayCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              style={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No categories available</Text>
            </View>
          )}
        </View>

        {/* Shop by Style Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Style</Text>
          </View>
          {featuredStylesLoading ? (
            <View style={styles.horizontalList}>
              <FlatList
                data={[1, 2, 3]}
                renderItem={() => <ShimmerProductCard width={140} noMargin />}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stylesList}
              />
            </View>
          ) : displayStyles.length > 0 ? (
            <FlatList
              data={displayStyles}
              renderItem={renderStyleItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stylesList}
              style={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No styles available</Text>
            </View>
          )}
        </View>

        {/* Recommended for You Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          {(hasToken ? personalizedLoading : (randomLoading || recommendedLoading)) ? (
            <ShimmerHorizontalList count={4} cardWidth={screenWidth * 0.75} />
          ) : displayRecommendedProducts.length > 0 ? (
            <FlatList
              data={displayRecommendedProducts}
              renderItem={renderRecommendedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
              style={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recommended products</Text>
            </View>
          )}
        </View>

        {/* Top Brands Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Brands</Text>
          </View>
          {topBrandsLoading ? (
            <View style={styles.horizontalList}>
              <FlatList
                data={[1, 2, 3]}
                renderItem={() => <ShimmerBrandItem />}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.brandsList}
              />
            </View>
          ) : displayTopBrands.length > 0 ? (
            <FlatList
              data={displayTopBrands}
              renderItem={renderBrandItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsList}
              style={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No brands available</Text>
            </View>
          )}
        </View>

        {/* Featured Items Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Items</Text>
          </View>
          {featuredLoading ? (
            <ShimmerHorizontalList count={4} cardWidth={screenWidth * 0.75} />
          ) : displayFeaturedProducts.length > 0 ? (
            <FlatList
              data={displayFeaturedProducts}
              renderItem={renderRecommendedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
              style={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No featured products</Text>
            </View>
          )}
        </View>

        {/* Custom Home Categories (below Featured) */}
        {Array.isArray(homeCategoriesArray) && homeCategoriesArray.length > 0 && homeCategoriesArray.map((cat: any) => {
          const products = (cat.products || []).map((p: any) => ({
            id: p._id,
            name: p.name,
            brand: p.brand || '',
            price: formatPrice(p.price),
            rating: formatRating(p.rating ?? 0, p.reviewCount ?? 0),
            image: getFirstImageSource(p.images, images.velvetShawl),
          }));
          if (products.length === 0) return null;
          return (
            <View key={cat._id} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{cat.name}</Text>
              </View>
              <FlatList
                data={products}
                renderItem={renderRecommendedItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedList}
                style={styles.horizontalList}
              />
            </View>
          );
        })}

        {/* Recently Added Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
          </View>
          {recentlyAddedLoading ? (
            <ShimmerHorizontalList count={2} />
          ) : displayRecentlyAddedProducts.length > 0 ? (
            <FlatList
              data={displayRecentlyAddedProducts}
              renderItem={renderRecommendedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
              style={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recently added products</Text>
            </View>
          )}
        </View>

        {/* Bottom Grid Section - Infinite scroll (load more when near bottom) */}
        <View style={styles.bottomGridContainer}>
          {allProductsLoading ? (
            <ShimmerGrid columns={2} count={4} />
          ) : displayBottomGridProducts.length > 0 ? (
            <>
              <FlatList
                data={displayBottomGridProducts}
                renderItem={renderBottomGridItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={styles.bottomGridList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={6}
                windowSize={5}
              />
              {isFetchingNextPage && (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No products available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeView>
  );
};

export default HomeScreen;
