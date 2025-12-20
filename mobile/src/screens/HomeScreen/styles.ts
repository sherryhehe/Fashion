import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const useStyles = ()=>{
  return StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for floating bottom tab
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    width: 20,
    height: 20,
    tintColor: '#2C2C2E',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 10,
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: '#2C2C2E',
  },

  // Greeting and Search Styles
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  greetingText: {
    fontSize: 20,
    color: '#2C2C2E',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },

  // Hero Banner Styles
  heroSection: {
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  carousel: {
    height: 280,
  },
  heroImageContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  heroCTA: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  carouselIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
    borderRadius: 4,
  },

  // Section Styles
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#2C2C2E',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
    textDecorationLine: 'underline',
  },

  // Categories Styles
  horizontalList:{
    width: Dimensions.get('window').width,
    left: -20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
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
  },

  // Styles Styles
  stylesList: {
    paddingHorizontal: 20,
  },
  styleItem: {
    width: 140,
    marginRight: 15,
    alignItems: 'center',
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

  // Recommended Products Styles
  recommendedList: {
    paddingHorizontal: 20,
    paddingVertical:2,
  },
  recommendedItem: {
    width: screenWidth * 0.75,
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
  },
  recommendedImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    resizeMode: 'cover',
  },
  recommendedContent: {
    padding: 12,
  },
  brandLogo: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '400',
  },
  recommendedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  nameAndRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedName: {
    fontSize: 14,
    color: '#2C2C2E',
    fontWeight: '400',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 12,
    height: 12,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },

  // Top Brands Styles
  brandsList: {
    paddingHorizontal: 20,
    paddingVertical:2,
  },
  brandItem: {
    width: 160,
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

  // Bottom Grid Styles
  bottomGridContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  bottomGridList: {
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  bottomGridItem: {
    width: '46%',
    marginHorizontal: 5,
    marginBottom: 20,
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
  },
  bottomImageContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bottomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cartIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  cartIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  heartIconFilled: {
    tintColor: '#FF3B30',
  },
  bottomContent: {
    padding: 12,
  },
  bottomRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomStarIcon: {
    width: 12,
    height: 12,
    marginRight: 3,
  },
  bottomRatingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  bottomBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogoPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E5E7',
    marginRight: 6,
  },
  bottomBrandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  bottomBrandName: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  verifyIcon: {
    width: 12,
    height: 12,
    tintColor: '#007AFF',
  },
  bottomProductName: {
    fontSize: 14,
    color: '#2C2C2E',
    marginBottom: 4,
    fontWeight: '500',
  },
  bottomPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 100,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
})}

export default useStyles;
