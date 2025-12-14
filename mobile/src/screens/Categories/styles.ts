import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },

  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#8E8E93',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2E',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: '#2C2C2E',
  },

  // Section Styles
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 16,
  },

  // Top Products Styles
  topProductsList: {
    paddingRight: 20,
  },
  topProductCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topProductImageContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  topProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topProductCartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topProductCartIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  topProductContent: {
    padding: 12,
  },
  topProductBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  topProductBrand: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  topProductVerifyIcon: {
    width: 12,
    height: 12,
    tintColor: '#007AFF',
  },
  topProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  topProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },

  // Categories Grid Styles
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
  },
  categoryCard: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  categoryCardLarge: {
    width: screenWidth - 40,
    height: 140,
  },
  categoryLeft: {
    flex: 1,
  },
  categoryColorSection: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shopNowButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryRight: {
    flex: 1,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Top Brands Grid Styles
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  brandWrapper: {
    width: (screenWidth - 80) / 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  brandCard: {
    alignItems: 'center',
  },
  brandLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandLogoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  brandLogoText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  brandName: {
    fontSize: 12,
    color: '#2C2C2E',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 120,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    tintColor: '#E5E5E7',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default styles;
