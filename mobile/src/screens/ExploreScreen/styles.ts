import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const CARD_WIDTH_H = screenWidth * 0.48;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 22,
    height: 22,
    tintColor: '#2C2C2E',
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },

  // Shop by Brand - circular row
  brandsScrollContent: {
    paddingRight: 20,
    gap: 4,
  },
  // Brand item: circle (logo only) + name below
  brandItemWrapper: {
    width: 76,
    alignItems: 'center',
    marginRight: 4,
  },
  brandLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoCircleDark: {
    backgroundColor: '#2C2C2E',
  },
  brandCircleImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  brandCircleLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2E',
  },
  brandCircleLetterLight: {
    color: '#FFFFFF',
  },
  brandCircleName: {
    marginTop: 8,
    fontSize: 11,
    color: '#2C2C2E',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 76,
  },
  viewAllBrandCircle: {
    width: 76,
    alignItems: 'center',
    marginRight: 4,
  },
  viewAllCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllArrow: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  viewAllLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#2C2C2E',
    fontWeight: '500',
  },
  brandCirclePlaceholder: {
    width: 76,
    marginRight: 4,
  },

  // Product cards (horizontal + vertical)
  horizontalProductsContent: {
    paddingRight: 20,
  },
  productCard: {
    width: CARD_WIDTH_H,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  productCardFullWidth: {
    width: '100%',
    marginRight: 0,
  },
  productCardImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: 18,
    height: 18,
    tintColor: '#2C2C2E',
  },
  filterButtonOnCard: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconOnCard: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  productCardContent: {
    padding: 12,
  },
  productCardBrand: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  productCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 6,
  },
  productCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  productCardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2C2E',
  },
  categoryTag: {
    backgroundColor: '#E5E5E7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 90,
  },
  categoryTagText: {
    fontSize: 11,
    color: '#2C2C2E',
    fontWeight: '500',
  },

  // Recommended - list (full width cards)
  recommendedList: {
    gap: 16,
  },
  recommendedListItem: {
    width: '100%',
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendedGridItem: {
    width: (screenWidth - 20 - 20 - 12) / 2,
    marginBottom: 16,
  },

  // Layout toggles (list = single column, grid = 2 columns)
  layoutToggles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layoutToggle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layoutToggleActive: {
    borderColor: '#2C2C2E',
    backgroundColor: '#F2F2F7',
  },
  listIconOutline: {
    width: 18,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
    borderRadius: 2,
  },
  gridIconOutline: {
    width: 14,
    height: 14,
    justifyContent: 'space-between',
  },
  gridIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 14,
  },
  gridIconSmall: {
    width: 5,
    height: 5,
    borderWidth: 1.2,
    borderColor: '#2C2C2E',
    borderRadius: 1,
  },

  emptySection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default styles;
