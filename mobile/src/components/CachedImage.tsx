/**
 * CachedImage Component
 *
 * Thin wrapper around React Native's built-in <Image> that adds:
 *   - a placeholder / loading indicator while the image is resolving
 *   - graceful fallback on error
 *
 * Previously this wrapped `react-native-fast-image`, which is incompatible
 * with the New Architecture (Fabric) on RN 0.81 — its view manager props
 * don't wire up, so images render as blank boxes. React Native's built-in
 * Image component uses Fresco on Android and NSURLCache on iOS, so disk
 * caching still works out of the box.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  View,
} from 'react-native';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageProps['source'] | { uri: string };
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  /** Kept for API compatibility with previous FastImage-based version. */
  priority?: 'low' | 'normal' | 'high';
  /** Kept for API compatibility with previous FastImage-based version. */
  cache?: 'immutable' | 'web' | 'cacheOnly';
  /** Kept for API compatibility; always falls back gracefully on error now. */
  fallback?: boolean;
  placeholder?: ImageProps['source'];
  showLoadingIndicator?: boolean;
  loadingIndicatorColor?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  placeholder,
  showLoadingIndicator = true,
  loadingIndicatorColor = '#E0E0E0',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  priority: _priority,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cache: _cache,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fallback: _fallback,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Local images (require(...)) — render directly, no loading state needed.
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

  const imageSource = source as { uri?: string };

  // Local image object without a URI — pass through.
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

  // Remote image — show placeholder/spinner over it until it loads.
  return (
    <View style={[{ position: 'relative' }, style]}>
      {(isLoading || hasError) && (placeholder || showLoadingIndicator) && (
        <View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: loadingIndicatorColor,
            },
            style,
          ]}
        >
          {placeholder ? (
            <Image
              source={placeholder}
              style={style}
              resizeMode={resizeMode as ImageProps['resizeMode']}
            />
          ) : isLoading && showLoadingIndicator ? (
            <ActivityIndicator size="small" color="#999999" />
          ) : null}
        </View>
      )}
      <Image
        source={{ uri: imageSource.uri }}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </View>
  );
};

export default CachedImage;
