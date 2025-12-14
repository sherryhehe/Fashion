import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    width: 30, // Same width as back button for centering
  },
  scrollView: {
    paddingBottom: 100,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    color: '#666666',
  },
  categoryContainer: {
    paddingBottom: 20,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTab: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedCategoryTab: {
    backgroundColor: '#1A1A1A',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  selectedCategoryTabText: {
    color: '#FFFFFF',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productsList: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cartIconContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  cartIcon: {
    width: 16,
    height: 16,
  },
  productContent: {
    padding: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
    tintColor: '#FFD700',
  },
  ratingText: {
    fontSize: 12,
    color: '#666666',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogoPlaceholder: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    marginRight: 6,
  },
  brandName: {
    fontSize: 12,
    color: '#666666',
    marginRight: 4,
  },
  verifyIcon: {
    width: 12,
    height: 12,
    tintColor: '#007AFF',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
