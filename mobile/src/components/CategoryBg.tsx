import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CategoryBgProps {
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const CategoryBg: React.FC<CategoryBgProps> = ({
  size = 60,
  backgroundColor = '#F2F2F7',
  borderColor = '#E5E5E7',
  borderWidth = 1,
  style,
  children,
}) => {
  // Calculate hexagon dimensions
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4; // 40% of size for the hexagon radius
  const cornerRadius = size * 0.08; // 8% of size for rounded corners
  
  // Create hexagon path with rounded corners
  const createHexagonPath = () => {
    const points = [];
    // Generate 6 points for hexagon (60 degrees apart) with 90 degree rotation
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + Math.PI / 2; // 60 degrees per point + 90 degree rotation
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }
    
    // Create path with rounded corners using quadratic curves
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < 6; i++) {
      const currentPoint = points[i];
      const nextPoint = points[(i + 1) % 6];
      const prevPoint = points[(i - 1 + 6) % 6];
      
      // Calculate control points for rounded corners
      const dx1 = currentPoint.x - prevPoint.x;
      const dy1 = currentPoint.y - prevPoint.y;
      const dx2 = nextPoint.x - currentPoint.x;
      const dy2 = nextPoint.y - currentPoint.y;
      
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      
      // Normalize vectors
      const nx1 = dx1 / len1;
      const ny1 = dy1 / len1;
      const nx2 = dx2 / len2;
      const ny2 = dy2 / len2;
      
      // Calculate control points
      const control1X = currentPoint.x - nx1 * cornerRadius;
      const control1Y = currentPoint.y - ny1 * cornerRadius;
      const control2X = currentPoint.x + nx2 * cornerRadius;
      const control2Y = currentPoint.y + ny2 * cornerRadius;
      
      // Add line to first control point and quadratic curve to second control point
      path += ` L ${control1X} ${control1Y} Q ${currentPoint.x} ${currentPoint.y} ${control2X} ${control2Y}`;
    }
    
    path += ' Z'; // Close the path
    return path;
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Path
          d={createHexagonPath()}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
      </Svg>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default CategoryBg;
