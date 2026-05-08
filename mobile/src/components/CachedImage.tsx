/**
 * CachedImage Component
 *
 * Thin wrapper around React Native's built-in <Image> that adds:
 *   - graceful fallback to a placeholder when the remote image fails
 *   - optional loading indicator (off by default to avoid flashing the
 *     placeholder over cached images)
 *
 * Previously this wrapped `react-native-fast-image`, which is incompatible
 * with the New Architecture (Fabric) on RN 0.81. React Native's built-in
 * Image uses Fresco on Android and NSURLCache on iOS, so disk caching
 * still works out of the box.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  ImageErrorEventData,
} from 'react-native';

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
  placeholder,
  showLoadingIndicator = false,
  loadingIndicatorColor = '#F2F2F7',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  priority: _priority,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cache: _cache,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fallback: _fallback,
  onError: parentOnError,
  onLoad: parentOnLoad,
  ...props
}) => {
  if (typeof source === 'number') {
    return (
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        onError={parentOnError}
        onLoad={parentOnLoad}
        {...props}
      />
    );
  }

  const imageSource = source as { uri?: string } | null | undefined;

  if (!imageSource?.uri) {
    return (
      <Image
        source={(source as ImageProps['source']) || (placeholder as ImageProps['source'])}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        onError={parentOnError}
        onLoad={parentOnLoad}
        {...props}
      />
    );
  }

  const uri = imageSource.uri;

  return (
    <RemoteImage
      uri={uri}
      style={style}
      resizeMode={resizeMode}
      placeholder={placeholder}
      showLoadingIndicator={showLoadingIndicator}
      loadingIndicatorColor={loadingIndicatorColor}
      parentOnError={parentOnError}
      parentOnLoad={parentOnLoad}
      passthrough={props}
    />
  );
};

interface RemoteImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode: 'contain' | 'cover' | 'stretch' | 'center';
  placeholder?: ImageProps['source'];
  showLoadingIndicator: boolean;
  loadingIndicatorColor: string;
  parentOnError?: ImageProps['onError'];
  parentOnLoad?: ImageProps['onLoad'];
  passthrough: Record<string, any>;
}

const RemoteImage: React.FC<RemoteImageProps> = ({
  uri,
  style,
  resizeMode,
  placeholder,
  showLoadingIndicator,
  loadingIndicatorColor,
  parentOnError,
  parentOnLoad,
  passthrough,
}) => {
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setHasLoaded(false);
  }, [uri]);

  const handleError = useCallback(
    (event: NativeSyntheticEvent<ImageErrorEventData>) => {
      setHasError(true);
      parentOnError?.(event);
    },
    [parentOnError],
  );

  const handleLoad = useCallback(
    (event: any) => {
      setHasLoaded(true);
      parentOnLoad?.(event);
    },
    [parentOnLoad],
  );

  if (hasError && placeholder) {
    return (
      <Image
        source={placeholder}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        {...passthrough}
      />
    );
  }

  if (!showLoadingIndicator) {
    return (
      <Image
        source={{ uri }}
        style={style}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        onError={handleError}
        onLoad={handleLoad}
        {...passthrough}
      />
    );
  }

  return (
    <View style={[localStyles.container, style]}>
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFillObject, style]}
        resizeMode={resizeMode as ImageProps['resizeMode']}
        onError={handleError}
        onLoad={handleLoad}
        {...passthrough}
      />
      {!hasLoaded && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            localStyles.loadingOverlay,
            { backgroundColor: loadingIndicatorColor },
          ]}
          pointerEvents="none"
        >
          <ActivityIndicator size="small" color="#999999" />
        </View>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CachedImage;
