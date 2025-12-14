import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
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
    width: 30, // Same width as back button for centering
  },

  // Image Section Styles
  imageSection: {
    backgroundColor: '#F8F6F0', // Beige background
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainImageContainer: {
    position: 'relative',
    height: 460,
  },
  imageCarousel: {
    height: 460,
  },
  imageContainer: {
    height: 460,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
  },
  thumbnailGallery: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  thumbnailList: {
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#2C2C2E',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 6,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#2C2C2E',
  },

  // Product Info Section Styles
  productInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 2,
    tintColor: '#E5E5E7',
  },
  filledStar: {
    tintColor: '#FFD700',
  },
  ratingText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },

  // Brand Section Styles
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    resizeMode: 'cover',
  },
  brandDetails: {
    flex: 1,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginRight: 6,
  },
  verifyIcon: {
    width: 16,
    height: 16,
    tintColor: '#007AFF',
  },
  brandStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  brandStarIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
    tintColor: '#FFD700',
  },
  brandRatingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  brandFollowers: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  namePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  namePriceLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    color: '#2C2C2E',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  favoriteButton: {
    padding: 10,
    borderWidth:1,
    borderRadius:100,
    borderColor: '#8E8E93',
  },
  favoriteIcon: {
    width: 24,
    height: 24,
    tintColor: '#8E8E93',
  },
  favoriteIconFilled: {
    tintColor: '#FF3B30',
  },
  favoriteButtonDisabled: {
    opacity: 0.5,
  },

  // Colors Section Styles
  colorsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2E',
    marginBottom: 15,
  },
  colorsList: {
    paddingRight: 20,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
    minWidth: 100,
  },
  selectedColorItem: {
    borderColor: '#2C2C2E',
    borderWidth: 1,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  colorText: {
    fontSize: 14,
    color: '#2C2C2E',
    fontWeight: '500',
  },
  selectedColorText: {
    color: '#2C2C2E',
    fontWeight: '600',
  },

  // Sizes Section Styles
  sizesSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F2F2F7',
  },
  sizesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sizeChartText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2C2C2E',
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeButton: {
    minWidth: 60,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth:1
  },
  selectedSizeButton: {
    backgroundColor: '#2C2C2E',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },

  // Quantity Section Styles
  quantitySection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 20,
    height: 20,
    borderRadius: 20,
    padding:10,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonImage: {
    width: 10,
    height: 10,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2E',
    marginHorizontal: 10,
    minWidth: 30,
    textAlign: 'center',
  },

  // Description Section Styles
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  descriptionText: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Reviews Section Styles
  reviewsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addReviewButton: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addReviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewItem: {
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    marginRight: 12,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  reviewTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  reviewText: {
    fontSize: 14,
    color: '#2C2C2E',
    lineHeight: 22,
    marginBottom: 15,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  thumbsUpIcon: {
    width: 16,
    height: 16,
    tintColor: '#8E8E93',
    marginRight: 5,
  },
  thumbsDownIcon: {
    width: 16,
    height: 16,
    tintColor: '#8E8E93',
    marginRight: 5,
  },
  reviewActionText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  wasUsefulText: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Recommended Section Styles
  recommendedSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    textDecorationLine: 'underline',
    marginBottom: 15,

  },
  recommendedList: {
    paddingRight: 20,
  },
  recommendedItem: {
    width: 220,
    marginRight: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  recommendedContent: {
    padding: 12,
  },
  recommendedBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E5E7',
    marginRight: 6,
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
  recommendedRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedStarIcon: {
    width: 12,
    height: 12,
    marginRight: 3,
    tintColor: '#FFD700',
  },
  recommendedRatingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  recommendedProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  recommendedPriceButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedPrice: {
    fontSize: 14,
    color: '#2C2C2E',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addToCartIcon: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
    marginLeft: 6,
  },
  addToCartText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // Bottom Action Bar Styles
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    marginTop: 20,
  },
  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cartButtonDisabled: {
    opacity: 0.6,
  },
  cartIcon: {
    width: 24,
    height: 24,
    tintColor: '#2C2C2E',
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default styles;
