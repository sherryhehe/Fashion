import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ShimmerLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth * 2, screenWidth * 2],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// Pre-built shimmer components for common use cases
export const ShimmerProductCard = () => (
  <View style={styles.productCardContainer}>
    <ShimmerLoader width="100%" height={180} borderRadius={8} />
    <View style={styles.productCardContent}>
      <ShimmerLoader width="60%" height={12} borderRadius={4} style={styles.marginBottom} />
      <ShimmerLoader width="80%" height={12} borderRadius={4} style={styles.marginBottom} />
      <ShimmerLoader width="40%" height={16} borderRadius={4} />
    </View>
  </View>
);

export const ShimmerCategoryItem = () => (
  <View style={styles.categoryItemContainer}>
    <ShimmerLoader width={80} height={80} borderRadius={40} />
    <ShimmerLoader width={60} height={12} borderRadius={4} style={styles.marginTop} />
  </View>
);

export const ShimmerBrandItem = () => (
  <View style={styles.brandItemContainer}>
    <ShimmerLoader width={60} height={60} borderRadius={30} />
    <ShimmerLoader width={50} height={12} borderRadius={4} style={styles.marginTop} />
  </View>
);

export const ShimmerHorizontalList = ({ count = 3 }: { count?: number }) => (
  <View style={styles.horizontalListContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <ShimmerProductCard key={index} />
    ))}
  </View>
);

export const ShimmerGrid = ({ columns = 2, count = 6 }: { columns?: number; count?: number }) => (
  <View style={[styles.gridContainer, { flexDirection: 'row', flexWrap: 'wrap' }]}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={{ width: `${100 / columns}%`, padding: 8 }}>
        <ShimmerProductCard />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E5E7',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  productCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productCardContent: {
    padding: 12,
  },
  marginBottom: {
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 8,
  },
  categoryItemContainer: {
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 20,
  },
  brandItemContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  horizontalListContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  gridContainer: {
    paddingHorizontal: 20,
  },
});

export default ShimmerLoader;

