import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
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
        borderWidth: 1,
        borderRadius: 100,
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

    // Search Bar Styles
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 44,
    },
    searchIcon: {
        width: 18,
        height: 18,
        tintColor: '#8E8E93',
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#2C2C2E',
    },

    // Content Styles
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    wishlistContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 15,
    },

    // Wishlist Item Styles
    wishlistItem: {
        flexDirection: 'row',
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
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8ECF4',
    },
    productImage: {
        width: 120,
        height: "100%",
        marginRight: 15,
        resizeMode: 'cover',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-evenly',
        paddingVertical: 15,
        paddingRight: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 8,
    },
    productAttributes: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    attributeText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '400',
    },
    separator: {
        width: 1,
        height: 12,
        backgroundColor: '#E5E5E7',
        marginHorizontal: 8,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 12,
    },

    // Action Buttons Styles
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8ECF4',
    },
    deleteButtonDisabled: {
        opacity: 0.5,
    },
    deleteIcon: {
        width: 18,
        height: 18,
        tintColor: '#FF3B30',
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2C2C2E',
        borderRadius: 100,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginLeft: 12,
    },
    addToCartButtonDisabled: {
        opacity: 0.5,
    },
    addToCartText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 8,
    },
    cartIcon: {
        width: 16,
        height: 16,
        tintColor: '#FFFFFF',
    },

    // Empty State Styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
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
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default styles;
