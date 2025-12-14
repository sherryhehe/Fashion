/**
 * CachedImage Component
 * Wraps react-native-fast-image with fallback to React Native Image
 * Provides automatic caching for faster image loading with placeholder support
 */

import React, { useState } from 'react';
import { Image, ImageProps, StyleProp, ImageStyle, View, ActivityIndicator } from 'react-native';

// Try to import FastImage, fallback gracefully if not available
let FastImage: any = null;
let FastImageAvailable = false;

try {
  FastImage = require('react-native-fast-image').default;
  FastImageAvailable = true;
} catch (error) {
  // FastImage not available - will use regular Image component with cache props
}

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageProps['source'] | { uri: string };
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  priority?: 'low' | 'normal' | 'high';
  cache?: 'immutable' | 'web' | 'cacheOnly';
  fallback?: boolean;
  placeholder?: ImageProps['source'];
  showLoadingIndicator?: boolean;
  loadingIndicatorColor?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  cache = 'immutable',
  fallback = true,
  placeholder,
  showLoadingIndicator = true,
  loadingIndicatorColor = '#E0E0E0',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle local images (require statements) - use regular Image
  if (typeof source === 'number') {
    return (
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        {...props}
      />
    );
  }

  // Handle URI sources - use FastImage for caching if available
  const imageSource = source as { uri?: string };
  
  // Check if it's a local image object without URI
  if (!imageSource?.uri) {
    return (
      <Image
        source={source as ImageProps['source']}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        {...props}
      />
    );
  }

  // Use FastImage for remote images with caching if available
  if (FastImageAvailable && FastImage) {
    try {
      // Map priority string to FastImage priority enum
      const fastImagePriority = 
        priority === 'high' ? FastImage.priority.high :
        priority === 'low' ? FastImage.priority.low :
        FastImage.priority.normal;

      // Map cache string to FastImage cache control enum
      const fastImageCache = 
        cache === 'web' ? FastImage.cacheControl.web :
        cache === 'cacheOnly' ? FastImage.cacheControl.cacheOnly :
        FastImage.cacheControl.immutable;

      const fastImageSource = {
        uri: imageSource.uri,
        priority: fastImagePriority,
        cache: fastImageCache,
      };

      return (
        <View style={[{ position: 'relative' }, style]}>
          {isLoading && (placeholder || showLoadingIndicator) && (
            <View style={[
              { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: loadingIndicatorColor },
              style
            ]}>
              {placeholder ? (
                <Image
                  source={placeholder}
                  style={style}
                  resizeMode={resizeMode as ImageProps['resizeMode']}
                />
              ) : showLoadingIndicator ? (
                <ActivityIndicator size="small" color="#999999" />
              ) : null}
            </View>
          )}
          <FastImage
            source={fastImageSource}
            style={style}
            resizeMode={resizeMode}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(error) => {
              setIsLoading(false);
              setHasError(true);
            }}
            {...props}
          />
        </View>
      );
    } catch (error) {
      // Fallback to regular Image if FastImage fails
      if (fallback) {
        return (
          <View style={[{ position: 'relative' }, style]}>
            {isLoading && (placeholder || showLoadingIndicator) && (
              <View style={[
                { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: loadingIndicatorColor },
                style
              ]}>
                {placeholder ? (
                  <Image
                    source={placeholder}
                    style={style}
                    resizeMode={resizeMode as ImageProps['resizeMode']}
                  />
                ) : showLoadingIndicator ? (
                  <ActivityIndicator size="small" color="#999999" />
                ) : null}
              </View>
            )}
            <Image
              source={source as ImageProps['source']}
              style={style}
              resizeMode={resizeMode as ImageProps['resizeMode']}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={(error) => {
                setIsLoading(false);
                setHasError(true);
              }}
              {...props}
            />
          </View>
        );
      }
    }
  }

  // Fallback to regular Image component with cache props (iOS only)
  return (
    <View style={[{ position: 'relative' }, style]}>
      {isLoading && (placeholder || showLoadingIndicator) && (
        <View style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: loadingIndicatorColor },
          style
        ]}>
          {placeholder ? (
            <Image
              source={placeholder}
              style={style}
              resizeMode={resizeMode as ImageProps['resizeMode']}
            />
          ) : showLoadingIndicator ? (
            <ActivityIndicator size="small" color="#999999" />
          ) : null}
        </View>
      )}
      <Image
        source={source as ImageProps['source']}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        // iOS cache props
        {...(typeof source === 'object' && source?.uri && { cache: 'force-cache' } as any)}
        {...props}
      />
    </View>
  );
};

export default CachedImage;
