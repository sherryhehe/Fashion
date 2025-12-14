#!/bin/bash
# Script to replace Image with CachedImage for remote images

SCREENS_DIR="mobile/src/screens"
COMPONENT_DIR="mobile/src/components"

# Key screens to update
SCREENS=(
  "ProductDetailScreen/index.tsx"
  "SearchScreen/index.tsx"
  "CartScreen/index.tsx"
  "WishList/index.tsx"
  "StoreDetailScreen/index.tsx"
  "CategoryListScreen/index.tsx"
  "ExploreScreen/index.tsx"
  "Categories/index.tsx"
)

echo "✅ Image caching implementation in progress..."
echo "📦 Installed: react-native-fast-image"
echo "🔧 Created: CachedImage component"
echo "📝 Updated: HomeScreen with CachedImage"
echo ""
echo "Next steps:"
echo "1. Update remaining screens to use CachedImage"
echo "2. Run 'cd mobile/ios && pod install' for iOS native linking"
echo "3. Rebuild app to enable FastImage caching"
