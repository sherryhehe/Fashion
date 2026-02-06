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
export const ShimmerProductCard = ({ style, width, noMargin }: { style?: any; width?: number | string; noMargin?: boolean }) => {
  const cardWidth = width || '100%';
  return (
    <View style={[
      styles.productCardContainer, 
      { width: cardWidth },
      noMargin && styles.productCardNoMargin,
      style
    ]}>
      <ShimmerLoader width="100%" height={180} borderRadius={8} />
      <View style={styles.productCardContent}>
        <ShimmerLoader width="60%" height={12} borderRadius={4} style={styles.marginBottom} />
        <ShimmerLoader width="80%" height={12} borderRadius={4} style={styles.marginBottom} />
        <ShimmerLoader width="40%" height={16} borderRadius={4} />
      </View>
    </View>
  );
};

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

export const ShimmerHorizontalList = ({ count = 3, cardWidth }: { count?: number; cardWidth?: number }) => {
  const screenWidth = Dimensions.get('window').width;
  const padding = 20;
  const gap = 15;
  const availableWidth = screenWidth - (padding * 2);
  const defaultCardWidth = cardWidth || (availableWidth * 0.75); // 75% of available width for horizontal cards
  
  return (
    <View style={styles.horizontalListContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View 
          key={index} 
          style={[
            { width: defaultCardWidth },
            index < count - 1 && { marginRight: gap }
          ]}
        >
          <ShimmerProductCard width="100%" noMargin />
        </View>
      ))}
    </View>
  );
};

export const ShimmerGrid = ({ columns = 2, count = 6 }: { columns?: number; count?: number }) => {
  const screenWidth = Dimensions.get('window').width;
  const padding = 20;
  const gap = 10;
  const availableWidth = screenWidth - (padding * 2);
  const itemWidth = (availableWidth - (gap * (columns - 1))) / columns;
  
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const isLastInRow = col === columns - 1;
        const isLastRow = row === Math.floor((count - 1) / columns);
        
        return (
          <View 
            key={index} 
            style={[
              {
                width: itemWidth,
                marginRight: isLastInRow ? 0 : gap,
                marginBottom: isLastRow ? 0 : gap,
              }
            ]}
          >
            <ShimmerProductCard width="100%" noMargin />
          </View>
        );
      })}
    </View>
  );
};

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
    width: '100%',
  },
  productCardNoMargin: {
    marginBottom: 0,
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
    width: 80,
  },
  brandItemContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: 160,
    marginRight: 15,
  },
  horizontalListContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  horizontalCardMargin: {
    marginRight: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  gridItem: {
    // Width and margins are set dynamically in component
  },
});

export default ShimmerLoader;

