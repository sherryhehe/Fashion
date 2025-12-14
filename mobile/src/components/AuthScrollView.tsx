import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import images from '../assets/images';

const { height } = Dimensions.get('window');

interface AuthScrollViewProps {
  children: React.ReactNode;
  headerImage?: any;
  backgroundColor?: string;
  contentBackgroundColor?: string;
  style?: ViewStyle;
  scrollViewStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

const AuthScrollView: React.FC<AuthScrollViewProps> = ({
  children,
  headerImage = images.authHeader,
  backgroundColor = '#FFFFFF',
  contentBackgroundColor = '#FFFFFF',
  style,
  scrollViewStyle,
  contentStyle,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Header Image - Position Absolute */}
      <Image 
        source={headerImage} 
        style={styles.headerImage} 
        resizeMode="cover"
        onError={(error) => console.log('Image load error:', error)}
        onLoad={() => console.log('Image loaded successfully')}
      />
      
      {/* ScrollView with Top Padding */}
      <ScrollView 
        style={[styles.scrollView, scrollViewStyle]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* White Content View */}
        <View style={[
          styles.contentView, 
          { backgroundColor: contentBackgroundColor },
          contentStyle
        ]}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.45,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: height * 0.4, // 40% of screen height
    flexGrow: 1,
  },
  contentView: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
    minHeight: height * 0.6, // Ensure minimum height
  },
});

export default AuthScrollView;
