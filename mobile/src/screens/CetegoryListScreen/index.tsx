import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { SafeView, SearchFilterBar, CategoryBg } from '../../components';
import { icons } from '../../assets/icons';
import images from '../../assets/images';
import { getImageSource } from '../../utils/imageHelper';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap:20
  },
  backButton: {
    padding: 5,
    borderWidth:1,
    borderRadius:100
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: '#2C2C2E',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  // Categories Styles - exactly from HomeScreen
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 20,
    width: (screenWidth - 40 - (3 * 15)) / 4, // 4 columns with proper spacing
  },
  categoryIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2E',
    textAlign: 'center',
    marginTop: 8,
  },

  // Styles Styles - exactly from HomeScreen
  styleItem: {
    width: (screenWidth - 40 - 15) / 2, // 2 columns
    marginRight: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  styleImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  styleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    textAlign: 'center',
  },

  // Top Brands Styles - exactly from HomeScreen
  brandItem: {
    width: (screenWidth - 40 - 15) / 2, // 2 columns
    marginRight: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    padding: 15,
    marginBottom: 20,
  },
  brandImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
  },
  brandImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  brandContent: {
    alignItems: 'center',
    width: '100%',
  },
  brandRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandStarIcon: {
    width: 12,
    height: 12,
    marginRight: 3,
  },
  brandRatingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 4,
    textAlign: 'center',
  },
  brandDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    tintColor: '#E5E5E7',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

type CategoryListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CategoryList'
>;

type CategoryListScreenRouteProp = RouteProp<
  RootStackParamList,
  'CategoryList'
>;

interface CategoryListScreenProps {
  navigation: CategoryListScreenNavigationProp;
  route: CategoryListScreenRouteProp;
}

// Define different list item types
export type ListItemType = 'category' | 'style' | 'brand';

export interface BaseListItem {
  id: string;
  name: string;
}

export interface CategoryItem extends BaseListItem {
  icon: any;
}

export interface StyleItem extends BaseListItem {
  image: any;
}

export interface BrandItem extends BaseListItem {
  description: string;
  rating: string;
  image: any;
  storeName?: string;
  storeType?: string;
  bannerImage?: any;
  logoImage?: any;
}

export type ListItem = CategoryItem | StyleItem | BrandItem;

const CategoryListScreen: React.FC<CategoryListScreenProps> = ({
  navigation,
  route,
}) => {
  
  // Extract parameters from route
  const params = route.params || {};
  const {
    title = 'List',
    data = [],
    listType = 'category' as ListItemType,
    numColumns = 2,
    showSearch = true,
    showBackButton = true,
    headerText,
    searchPlaceholder = 'Search items...',
  } = params;

  // Format data from API to use actual images from backend
  const formatListData = (rawData: any[]): ListItem[] => {
    if (!rawData || rawData.length === 0) return [];
    
    // Check if data is already formatted (has icon/image fields)
    if (rawData[0] && ('icon' in rawData[0] || 'image' in rawData[0])) {
      return rawData as ListItem[];
    }
    
    // Format raw API data
    return rawData.map((item) => {
      const baseItem = {
        id: item._id || item.id,
        name: item.name,
      };
      
      if (listType === 'category') {
        // For categories, use image from API if available, otherwise use icon fallback
        const categoryItem: CategoryItem = {
          ...baseItem,
          icon: item.image 
            ? null // If image exists, we'll handle it differently
            : (() => {
                // Fallback to icon mapping only if no image from API
                const name = item.name.toLowerCase();
                if (name.includes('accessor')) return icons.accessories;
                if (name.includes('bag')) return icons.bags;
                if (name.includes('shoe')) return icons.shoes;
                if (name.includes('makeup') || name.includes('beauty')) return icons.makeup;
                if (name.includes('cloth') || name.includes('dress') || name.includes('shirt')) return icons.clothes;
                return icons.clothes;
              })(),
        };
        // Add image field if API provides it
        if (item.image) {
          (categoryItem as any).image = getImageSource(item.image);
        }
        return categoryItem;
      } else if (listType === 'style') {
        // For styles, use image from API
        const styleItem: StyleItem = {
          ...baseItem,
          image: item.image 
            ? getImageSource(item.image, images.casual)
            : (() => {
                // Fallback to name-based mapping only if no image from API
                const name = item.name.toLowerCase();
                if (name.includes('casual')) return images.casual;
                if (name.includes('desi') || name.includes('traditional')) return images.desi;
                if (name.includes('street') || name.includes('urban')) return images.streetwear;
                return images.casual;
              })(),
        };
        return styleItem;
      } else if (listType === 'brand') {
        // For brands, use logo from API
        const brandItem: BrandItem = {
          ...baseItem,
          description: item.description || '',
          rating: item.rating ? `${item.rating.toFixed(1)} (${item.reviewCount || 0})` : '0.0 (0)',
          image: item.logo ? getImageSource(item.logo, images.shopLogo) : images.shopLogo,
          storeName: item.name,
          storeType: item.description || 'Store',
          bannerImage: item.banner ? getImageSource(item.banner) : images.shopBanner,
          logoImage: item.logo ? getImageSource(item.logo, images.shopLogo) : images.shopLogo,
        };
        return brandItem;
      }
      
      return baseItem as ListItem;
    });
  };

  // Use formatted data with API images
  const listData = formatListData(data || []);

  // Determine numColumns based on listType if not explicitly provided
  const getNumColumns = () => {
    if (params.numColumns) return params.numColumns;
    
    switch (listType) {
      case 'category':
        return 4;
      case 'style':
        return 2;
      case 'brand':
        return 2;
      default:
        return 2;
    }
  };

  const actualNumColumns = getNumColumns();

  // Render different item types - exactly as in HomeScreen
  const renderCategoryItem = ({ item, index }: { item: CategoryItem; index: number }) => {
    // Use image from API if available, otherwise use icon
    const imageSource = (item as any).image || item.icon;
    const isImageUri = imageSource && typeof imageSource === 'object' && imageSource.uri;
    
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('Search', {
          autoFocus: false,
          headerText: item.name,
          initialCategory: item.name, // Pass category name for filtering
        })} 
        style={styles.categoryItem}
      >
        <CategoryBg size={80}>
          {isImageUri ? (
            <Image source={imageSource} style={[styles.categoryIcon,{width: index === 4 ? 35 : 60}]} />
          ) : (
            <Image source={imageSource || icons.clothes} style={[styles.categoryIcon,{width: index === 4 ? 35 : 60}]} />
          )}
        </CategoryBg>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderStyleItem = ({ item }: { item: StyleItem }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Search', {
        autoFocus: false,
        headerText: item.name,
        initialStyle: item.name, // Pass style name for style filtering
      })} 
      style={styles.styleItem}
    >
      <Image source={item.image} style={styles.styleImage} />
      <Text style={styles.styleName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBrandItem = ({ item }: { item: BrandItem }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => navigation.navigate('StoreDetail', { storeId: item.id })}
    >
      <View style={styles.brandImageContainer}>
        <Image source={item.image} style={styles.brandImage} />
      </View>
      <View style={styles.brandContent}>
        <View style={styles.brandRatingContainer}>
          <Image source={icons.star} style={styles.brandStarIcon} />
          <Text style={styles.brandRatingText}>{item.rating}</Text>
        </View>
        <Text style={styles.brandName}>{item.name}</Text>
        <Text style={styles.brandDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  // Conditional render item based on list type
  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    switch (listType) {
      case 'category':
        return renderCategoryItem({ item: item as CategoryItem, index });
      case 'style':
        return renderStyleItem({ item: item as StyleItem });
      case 'brand':
        return renderBrandItem({ item: item as BrandItem });
      default:
        return renderCategoryItem({ item: item as CategoryItem, index });
    }
  };

  const getItemLayout = (data: any, index: number) => {
    let itemHeight = 120; // Default height
    
    // Adjust height based on list type
    switch (listType) {
      case 'category':
        itemHeight = 120; // CategoryBg + text
        break;
      case 'style':
        itemHeight = 220; // Image height + text
        break;
      case 'brand':
        itemHeight = 200; // Brand item height
        break;
      default:
        itemHeight = 120;
    }
    
    return {
      length: itemHeight,
      offset: itemHeight * Math.floor(index / actualNumColumns),
      index,
    };
  };

  return (
    <SafeView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={icons.backArrow} style={styles.backIcon} />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerText || title}</Text>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchFilterBar
            placeholder={searchPlaceholder}
            isNavigational={false}
            showFilters={false}
          />
        </View>
      )}

      {/* List */}
      {listData.length > 0 ? (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={actualNumColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={
            actualNumColumns > 1 ? styles.columnWrapper : undefined
          }
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
        />
      ) : (
        <View style={styles.emptyState}>
          <Image source={icons.search} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Data Found</Text>
          <Text style={styles.emptySubtitle}>
            {headerText ? `No ${headerText.toLowerCase()} available at the moment.` : 'No items available at the moment.'}
          </Text>
        </View>
      )}
    </SafeView>
  );
};

export default CategoryListScreen;
