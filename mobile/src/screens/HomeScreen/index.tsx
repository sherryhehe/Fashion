import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
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
import { useTopBrands, useBrands } from '../../hooks/useBrands';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '../../hooks/useWishlist';
import { requireAuthOrPromptLogin } from '../../utils/guestHelper';
import { useFeaturedStyles, usePopularStyles } from '../../hooks/useStyles';
import { useBanners } from '../../hooks/useBanners';
import { useHomeCategoriesForApp } from '../../hooks/useHomeCategories';
import { getFirstImageSource, getImageSource, preloadImages, getImageUrl } from '../../utils/imageHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

const HERO_BANNER_HEIGHT = 500;

const bottomGridColumnWrapper = {
  justifyContent: 'space-between' as const,
  paddingHorizontal: 20,
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const styles = useStyles();
  const { width: screenWidth } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeAutoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const { data: featuredProductsData, isLoading: featuredLoading, refetch: refetchFeatured } = useFeaturedProducts(8);
  const { data: recommendedProductsData, isLoading: recommendedLoading, refetch: refetchRecommended } = useRecommendedProducts(10);
  const [focusShuffleKey, setFocusShuffleKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusShuffleKey((k) => k + 1);
    }, [])
  );
  const { data: randomProductsData, isLoading: randomLoading } = useRandomProducts(10, focusShuffleKey);
  const {
    data: randomPicksData,
    isLoading: randomPicksLoading,
    refetch: refetchRandomPicks,
  } = useRandomProducts(20, focusShuffleKey + 1000);
  const { data: personalizedProductsData, isLoading: personalizedLoading } = usePersonalizedProducts(10, hasToken);
  const { refetch: refetchRecentlyAdded } = useRecentlyAddedProducts(8);
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
  const {
    data: brandBannersData,
    isLoading: brandBannersLoading,
    refetch: refetchBrandBanners,
  } = useBanners('homepage_brand', 'active');
  const { data: allBrandsData, refetch: refetchAllBrands } = useBrands();
  const { data: homeCategoriesData } = useHomeCategoriesForApp();

  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();

  const bannersArray = useMemo(() => bannersData?.data || [], [bannersData?.data]);
  const brandBannersArray = useMemo(() => brandBannersData?.data || [], [brandBannersData?.data]);
  const categoriesArray = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);
  const stylesArray = useMemo(() => featuredStylesData?.data || [], [featuredStylesData?.data]);
  const recommendedArray = useMemo(() => recommendedProductsData?.data || [], [recommendedProductsData?.data]);
  const personalizedArray = useMemo(() => personalizedProductsData?.data || [], [personalizedProductsData?.data]);
  const randomArray = useMemo(() => randomProductsData?.data || [], [randomProductsData?.data]);

  const recommendedSourceArray = useMemo(() => {
    if (hasToken && Array.isArray(personalizedArray) && personalizedArray.length > 0) {
      return personalizedArray;
    }
    if (Array.isArray(randomArray) && randomArray.length > 0) {
      return randomArray;
    }
    return recommendedArray;
  }, [hasToken, personalizedArray, randomArray, recommendedArray]);

  const topBrandsArray = useMemo(() => topBrandsData?.data || [], [topBrandsData?.data]);
  const allProductsArray = useMemo(
    () => infiniteProductsData?.pages?.flatMap((p: any) => p?.data ?? []) ?? [],
    [infiniteProductsData?.pages],
  );
  const allBrandsArray = useMemo(() => allBrandsData?.data || [], [allBrandsData?.data]);
  const homeCategoriesArray = useMemo(() => homeCategoriesData?.data || [], [homeCategoriesData?.data]);

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

  useEffect(() => {
    let priorityTimer: ReturnType<typeof setTimeout> | null = null;
    let belowFoldTimer: ReturnType<typeof setTimeout> | null = null;

    const preloadPriority = () => {
      const urls: string[] = [];
      bannersArray.forEach((b: any) => {
        const u = getImageUrl(b.imageUrl || b.image);
        if (u) urls.push(u);
      });
      categoriesArray.forEach((c: any) => {
        const u = getImageUrl(c.image);
        if (u) urls.push(u);
      });
      stylesArray.forEach((s: any) => {
        const u = getImageUrl(s.image);
        if (u) urls.push(u);
      });
      recommendedSourceArray.forEach((p: any) => {
        if (p.images && p.images.length > 0) {
          const u = getImageUrl(p.images[0]);
          if (u) urls.push(u);
        }
      });
      topBrandsArray.forEach((b: any) => {
        const u = getImageUrl(b.logo);
        if (u) urls.push(u);
      });
      if (urls.length > 0) preloadImages(urls).catch(() => {});
    };

    const preloadBelowFold = () => {
      const urls: string[] = [];
      allProductsArray.slice(0, 10).forEach((p: any) => {
        if (p.images && p.images.length > 0) {
          const u = getImageUrl(p.images[0]);
          if (u) urls.push(u);
        }
      });
      if (urls.length > 0) preloadImages(urls).catch(() => {});
    };

    priorityTimer = setTimeout(() => {
      if (
        !categoriesLoading &&
        !featuredStylesLoading &&
        !recommendedLoading &&
        !topBrandsLoading &&
        !bannersLoading &&
        (bannersArray.length > 0 || categoriesArray.length > 0)
      ) {
        preloadPriority();
      }
    }, 50);

    belowFoldTimer = setTimeout(() => {
      if (!allProductsLoading && allProductsArray.length > 0) {
        preloadBelowFold();
      }
    }, 1200);

    return () => {
      if (priorityTimer) clearTimeout(priorityTimer);
      if (belowFoldTimer) clearTimeout(belowFoldTimer);
    };
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

  const mapBannerToDisplayItem = useCallback((banner: any, index: number, fallbackPrefix: string) => ({
    id: String(banner.id || banner._id || `${fallbackPrefix}-${index}`),
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    cta: banner.subtitle || '',
    image: getImageSource(banner.imageUrl || banner.image, images.homesliderimage),
    link: banner.linkUrl || banner.link,
  }), []);

  const sortBannersByOrder = useCallback((items: any[]) => (
    [...items].sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    })
  ), []);

  const carouselData = useMemo(() => (
    bannersArray.length > 0
      ? [...bannersArray]
        .filter((banner) => !banner.position || banner.position === 'homepage')
        .sort((a, b) => {
          const orderA = a.order ?? 999;
          const orderB = b.order ?? 999;
          return orderA - orderB;
        })
        .map((banner, index) => mapBannerToDisplayItem(banner, index, 'banner'))
      : []
  ), [bannersArray, mapBannerToDisplayItem]);

  const brandBannerData = useMemo(() => (
    brandBannersArray.length > 0
      ? sortBannersByOrder(brandBannersArray)
        .filter((banner) => !banner.position || banner.position === 'homepage_brand')
        .map((banner, index) => mapBannerToDisplayItem(banner, index, 'brand-banner'))
      : []
  ), [brandBannersArray, mapBannerToDisplayItem, sortBannersByOrder]);

  const renderCarouselItem = useCallback(({ item }: { item: any }) => {
    const imageSource = typeof item.image === 'object' && item.image?.uri
      ? item.image
      : images.homesliderimage;
    const storeId = item.link?.trim?.();
    const brandName = item.title?.trim?.() || item.subtitle?.trim?.() || '';

    const handleBannerPress = () => {
      if (storeId) {
        navigation.getParent()?.navigate('StoreDetail', { storeId });
      }
    };

    return (
      <TouchableOpacity
        style={[styles.heroImageContainer, { width: screenWidth }]}
        activeOpacity={storeId ? 0.8 : 1}
        disabled={!storeId}
        onPress={handleBannerPress}
      >
        <CachedImage
          source={imageSource}
          style={styles.heroImage}
          resizeMode="cover"
          priority="high"
          cache="immutable"
        />
        {(brandName || storeId) ? (
          <View style={styles.heroOverlay}>
            <View style={styles.heroTextContainer}>
              {brandName ? <Text style={styles.heroTitle}>{brandName}</Text> : null}
              {storeId ? (
                <View style={styles.brandBannerCta}>
                  <Text style={styles.brandBannerCtaText}>Shop Now</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }, [navigation, screenWidth, styles]);

  const renderBrandBannerItem = useCallback(({ item }: { item: any }) => {
    const imageSource = typeof item.image === 'object' && item.image?.uri
      ? item.image
      : images.homesliderimage;
    const storeId = item.link?.trim?.();

    const handleBannerPress = () => {
      if (storeId) {
        navigation.getParent()?.navigate('StoreDetail', { storeId });
      }
    };

    return (
      <TouchableOpacity
        style={[styles.brandBannerCard, { width: screenWidth }]}
        activeOpacity={storeId ? 0.85 : 1}
        disabled={!storeId}
        onPress={handleBannerPress}
      >
        <CachedImage
          source={imageSource}
          style={styles.brandBannerImage}
          resizeMode="cover"
          priority="normal"
          cache="immutable"
        />
        {storeId ? (
          <View style={styles.bottomBannerCtaOverlay}>
            <View style={styles.bottomBannerCta}>
              <Text style={styles.bottomBannerCtaText}>Shop Now</Text>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }, [navigation, screenWidth, styles]);

  const scrollToCarouselIndex = useCallback((index: number, animated = true) => {
    flatListRef.current?.scrollToOffset({
      offset: index * screenWidth,
      animated,
    });
  }, [screenWidth]);

  useEffect(() => {
    if (carouselData.length <= 1 || !isAutoScrolling) {
      return;
    }

    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }

    autoScrollTimerRef.current = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % carouselData.length;
        scrollToCarouselIndex(nextSlide);
        return nextSlide;
      });
    }, 5000);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [carouselData.length, isAutoScrolling, scrollToCarouselIndex]);

  const scheduleAutoScrollResume = useCallback(() => {
    if (resumeAutoScrollTimerRef.current) {
      clearTimeout(resumeAutoScrollTimerRef.current);
    }
    resumeAutoScrollTimerRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 8000);
  }, []);

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      if (resumeAutoScrollTimerRef.current) {
        clearTimeout(resumeAutoScrollTimerRef.current);
      }
    };
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    setIsAutoScrolling(false);
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
    if (resumeAutoScrollTimerRef.current) {
      clearTimeout(resumeAutoScrollTimerRef.current);
    }
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    scheduleAutoScrollResume();
  }, [scheduleAutoScrollResume]);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index >= 0 && index < carouselData.length) {
      setCurrentSlide(index);
    }
    scheduleAutoScrollResume();
  }, [carouselData.length, scheduleAutoScrollResume, screenWidth]);

  const displayCategories = useMemo(() => {
    if (!Array.isArray(categoriesArray) || categoriesArray.length === 0) return [];
    return categoriesArray.map((category: any) => ({
      id: category._id,
      name: category.name,
      image: category.image ? getImageSource(category.image) : null,
      icon: category.image ? null : (() => {
        const name = category.name.toLowerCase();
        if (name.includes('accessor')) return icons.accessories;
        if (name.includes('bag')) return icons.bags;
        if (name.includes('shoe')) return icons.shoes;
        if (name.includes('makeup') || name.includes('beauty')) return icons.makeup;
        if (name.includes('cloth') || name.includes('dress') || name.includes('shirt')) return icons.clothes;
        return icons.clothes;
      })(),
    }));
  }, [categoriesArray]);

  const displayStyles = useMemo(() => {
    if (!Array.isArray(stylesArray) || stylesArray.length === 0) return [];
    return stylesArray.map((style: any) => {
      const hasImage = style.image && typeof style.image === 'string' && style.image.trim() !== '';
      const imageSource = hasImage
        ? getImageSource(style.image, images.casual)
        : (() => {
            const name = style.name.toLowerCase();
            if (name.includes('casual')) return images.casual;
            if (name.includes('desi') || name.includes('traditional')) return images.desi;
            if (name.includes('street') || name.includes('urban')) return images.streetwear;
            return images.casual;
          })();

      return {
        id: style._id,
        name: style.name,
        image: imageSource,
      };
    });
  }, [stylesArray]);

  const formatPrice = useCallback((price: number) => `PKR ${price.toLocaleString()}`, []);
  const formatRating = useCallback((rating: number, reviewCount: number) => `${rating.toFixed(1)} (${reviewCount})`, []);

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
  }, [recommendedSourceArray, focusShuffleKey, formatPrice, formatRating]);

  const displayRandomPicks = useMemo(() => {
    const randomPicksArray = randomPicksData?.data || [];
    if (!Array.isArray(randomPicksArray) || randomPicksArray.length === 0) return [];
    return shuffleArray(randomPicksArray).map(product => ({
      id: product._id,
      name: product.name,
      brand: product.brand || '',
      price: formatPrice(product.price),
      rating: formatRating(product.rating ?? 0, product.reviewCount ?? 0),
      image: getFirstImageSource(product.images, images.minicrossbody),
    }));
  }, [randomPicksData, focusShuffleKey, formatPrice, formatRating]);

  const displayTopBrands = useMemo(() => {
    if (!Array.isArray(topBrandsArray) || topBrandsArray.length === 0) return [];
    return topBrandsArray.map((brand: any) => {
      const brandLogo = brand.logo && brand.logo.trim() ? brand.logo : null;
      const brandImage = getImageSource(brandLogo, images.khussakraft);
      return {
        id: brand._id,
        name: brand.name,
        description: brand.description || '',
        rating: formatRating(brand.rating || 0, brand.reviewCount || 0),
        image: brandImage || images.khussakraft,
        storeName: brand.name,
        storeType: brand.businessInfo?.businessType || '',
        bannerImage: brand.banner ? getImageSource(brand.banner, images.shopBanner) : images.shopBanner,
        logoImage: getImageSource(brandLogo, images.shopLogo) || images.shopLogo,
      };
    });
  }, [topBrandsArray, formatRating]);

  const featuredArray = useMemo(() => featuredProductsData?.data || [], [featuredProductsData?.data]);
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
  }, [featuredArray, focusShuffleKey, formatPrice, formatRating]);

  const displayBottomGridProducts = useMemo(() => {
    if (!Array.isArray(allProductsArray) || allProductsArray.length === 0) return [];
    const seed = focusShuffleKey || 0;
    const randomizedProducts = [...allProductsArray].sort((a: any, b: any) => {
      const aId = a?._id || a?.id || '';
      const bId = b?._id || b?.id || '';
      return hashString(`${seed}:${aId}`) - hashString(`${seed}:${bId}`);
    });

    return randomizedProducts.map((product: any) => {
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
  }, [allProductsArray, brandMap, focusShuffleKey, formatPrice, formatRating]);

  const handleSeeMoreCategories = useCallback(() => {
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
  }, [categoriesArray, navigation]);

  const handleSeeMoreStyles = useCallback(() => {
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
  }, [stylesArray, navigation]);

  const handleSeeMoreBrands = useCallback(() => {
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
  }, [topBrandsArray, navigation]);

  const renderCategoryItem = useCallback(({ item, index }: { item: any, index: number }) => {
    const imageSource = item.image || item.icon || icons.clothes;
    return (
      <TouchableOpacity
        onPress={() => navigation.getParent()?.navigate('Search', {
          autoFocus: false,
          headerText: item.name,
          initialCategory: item.name,
        })}
        style={styles.categoryItem}
      >
        <CategoryBg size={80}>
          {item.image ? (
            <CachedImage source={imageSource} style={[styles.categoryIcon, { width: index === 4 ? 35 : 60 }]} priority="high" cache="immutable" />
          ) : (
            <Image source={item.icon || icons.clothes} style={[styles.categoryIcon, { width: index === 4 ? 35 : 60 }]} />
          )}
        </CategoryBg>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }, [navigation, styles]);

  const renderStyleItem = useCallback(({ item }: { item: any }) => {
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
        />
        <Text style={styles.styleName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }, [navigation, styles]);

  const renderRecommendedItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.recommendedItem}
      onPress={() => navigation.getParent()?.navigate('ProductDetail', { productId: item.id })}
    >
      <CachedImage
        source={item.image}
        style={styles.recommendedImage}
        priority="high"
        cache="immutable"
        placeholder={images.velvetShawl}
        fallback={true}
      />
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
  ), [navigation, styles]);

  const renderBrandItem = useCallback(({ item }: { item: any }) => {
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
            <Text style={styles.brandDescription} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, [navigation, styles]);

  const handleWishlistToggle = useCallback(async (productId: string, isInWishlist: boolean) => {
    const canProceed = await requireAuthOrPromptLogin(
      'add items to wishlist',
      navigation.getParent()
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
  }, [navigation, addToWishlistMutation, removeFromWishlistMutation]);

  const wishlistItems = wishlistData?.data;
  const wishlistLoading = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  const renderBottomGridItem = useCallback(({ item }: { item: any }) => {
    const isInWishlist = wishlistItems?.some((w: any) => w.productId === item.id || w.product?._id === item.id) || false;
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
            placeholder={images.bottomList.image1}
            fallback={true}
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
  }, [navigation, styles, wishlistItems, wishlistLoading, handleWishlistToggle]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['brands'] }),
        queryClient.invalidateQueries({ queryKey: ['styles'] }),
        queryClient.invalidateQueries({ queryKey: ['banners'] }),
        queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
        refetchCategories(),
        refetchFeatured(),
        refetchRecommended(),
        refetchRandomPicks(),
        refetchRecentlyAdded(),
        refetchTopBrands(),
        refetchStyles(),
        refetchAllProducts(),
        refetchBanners(),
        refetchBrandBanners(),
        refetchAllBrands(),
        queryClient.invalidateQueries({ queryKey: ['home-categories'] }),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, refetchCategories, refetchFeatured, refetchRecommended, refetchRandomPicks, refetchRecentlyAdded, refetchTopBrands, refetchStyles, refetchAllProducts, refetchBanners, refetchBrandBanners, refetchAllBrands]);

  const carouselGetItemLayout = useCallback(
    (_: any, index: number) => ({ length: screenWidth, offset: screenWidth * index, index }),
    [screenWidth],
  );

  const ListHeader = useMemo(() => (
    <View>
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>
          {userName ? `${greeting}, ${userName} 👋` : `${greeting} 👋`}
        </Text>
        <SearchFilterBar
          placeholder="Search brands, items or styles..."
          isNavigational={true}
          showFilters={false}
          showFilterButton={true}
        />
      </View>

      {bannersLoading ? (
        <View style={styles.heroSection}>
          <View style={{ width: screenWidth, height: HERO_BANNER_HEIGHT, backgroundColor: '#F2F2F7', borderRadius: 12 }} />
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
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={carouselGetItemLayout}
            style={styles.carousel}
            decelerationRate="fast"
            scrollEventThrottle={16}
            removeClippedSubviews={false}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
          />
          {carouselData.length > 1 && (
            <View style={styles.carouselIndicators}>
              {carouselData.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentSlide && styles.activeIndicator,
                  ]}
                  onPress={() => {
                    setIsAutoScrolling(false);
                    setCurrentSlide(index);
                    scrollToCarouselIndex(index);
                    scheduleAutoScrollResume();
                  }}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.heroSection}>
          <View style={{ width: screenWidth, height: HERO_BANNER_HEIGHT, backgroundColor: '#F2F2F7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#8E8E93', fontSize: 14 }}>No banners available</Text>
          </View>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Random Picks</Text>
        </View>
        {randomPicksLoading ? (
          <ShimmerHorizontalList count={4} cardWidth={screenWidth * 0.75} />
        ) : displayRandomPicks.length > 0 ? (
          <FlatList
            data={displayRandomPicks}
            renderItem={renderRecommendedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedList}
            style={styles.horizontalList}
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No random products available</Text>
          </View>
        )}
      </View>

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
            removeClippedSubviews={true}
            initialNumToRender={5}
            maxToRenderPerBatch={6}
            windowSize={5}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No categories available</Text>
          </View>
        )}
      </View>

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
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No styles available</Text>
          </View>
        )}
      </View>

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
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recommended products</Text>
          </View>
        )}
      </View>

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
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No brands available</Text>
          </View>
        )}
      </View>

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
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No featured products</Text>
          </View>
        )}
      </View>

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
              removeClippedSubviews={true}
              initialNumToRender={3}
              maxToRenderPerBatch={4}
              windowSize={5}
            />
          </View>
        );
      })}

      {(brandBannersLoading || brandBannerData.length > 0) && (
        <View style={styles.brandBannerSection}>
          {brandBannersLoading ? (
            <View style={styles.brandBannerSkeleton} />
          ) : (
            <FlatList
              data={brandBannerData}
              renderItem={renderBrandBannerItem}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandBannerList}
              scrollEnabled={false}
            />
          )}
        </View>
      )}
    </View>
  ), [
    styles, userName, greeting, bannersLoading, screenWidth, carouselData,
    renderCarouselItem, handleScrollBeginDrag, handleScrollEndDrag,
    handleMomentumScrollEnd, carouselGetItemLayout, currentSlide,
    scrollToCarouselIndex, scheduleAutoScrollResume,
    randomPicksLoading, displayRandomPicks, renderRecommendedItem,
    categoriesLoading, displayCategories, renderCategoryItem,
    featuredStylesLoading, displayStyles, renderStyleItem,
    hasToken, personalizedLoading, randomLoading, recommendedLoading,
    displayRecommendedProducts, topBrandsLoading, displayTopBrands, renderBrandItem,
    featuredLoading, displayFeaturedProducts, homeCategoriesArray,
    brandBannersLoading, brandBannerData, renderBrandBannerItem,
    formatPrice, formatRating,
  ]);

  const ListFooter = useMemo(() => {
    if (allProductsLoading || displayBottomGridProducts.length === 0) return null;
    if (hasNextPage) {
      return (
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            activeOpacity={0.8}
          >
            {isFetchingNextPage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loadMoreButtonText}>Load More</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [allProductsLoading, displayBottomGridProducts.length, hasNextPage, isFetchingNextPage, fetchNextPage, styles]);

  const ListEmpty = useMemo(() => {
    if (allProductsLoading) {
      return (
        <View style={styles.bottomGridContainer}>
          <ShimmerGrid columns={2} count={4} />
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No products available</Text>
      </View>
    );
  }, [allProductsLoading, styles]);

  const keyExtractor = useCallback((item: any) => item.id, []);

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

      <FlatList
        data={displayBottomGridProducts}
        renderItem={renderBottomGridItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={bottomGridColumnWrapper}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        removeClippedSubviews={true}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        windowSize={7}
      />
    </SafeView>
  );
};

export default HomeScreen;
