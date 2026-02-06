import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  
  // Header and Banner Styles
  headerContainer: {
    position: 'relative',
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
  },
  bannerTextContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: (screenWidth - 80) / 2,
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  storeLogo: {
    width: 100,
    height: 100,
    borderRadius: 30,
    resizeMode: 'cover',
  },

  // Store Information Styles
  storeInfoContainer: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeInfoLeft: {
    flex: 1,
  },
  storeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginRight: 8,
  },
  storeVerifyIcon: {
    width: 20,
    height: 20,
    tintColor: '#007AFF',
  },
  storeType: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  storeDescription: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 22,
    textAlign: 'left',
  },
  storeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#8E8E93',
  },

  // Navigation Tabs Styles
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2C2C2E',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2C2C2E',
    fontWeight: '600',
  },

  // Products Grid Styles
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productsList: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productItem: {
    width: (screenWidth - 60) / 2,
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
  productImageContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
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
  productContent: {
    padding: 12,
  },
  productRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  brandContainer: {
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
  brandLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    resizeMode: 'cover',
  },
  brandName: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  verifyIcon: {
    width: 12,
    height: 12,
    tintColor: '#007AFF',
  },
  productName: {
    fontSize: 14,
    color: '#2C2C2E',
    marginBottom: 4,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
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
  loadMoreContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default styles;
