/**
 * Avatar Component
 * Displays user avatar image or initials if no image available
 */

import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { CachedImage } from './CachedImage';
import { getInitials, getAvatarColor } from '../utils/avatarHelper';
import { getImageSource } from '../utils/imageHelper';

interface AvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: number;
  style?: ViewStyle;
  showBorder?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  avatar,
  size = 40,
  style,
  showBorder = false,
}) => {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  const hasAvatar = avatar && avatar.trim().length > 0;

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: hasAvatar ? 'transparent' : backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...(showBorder && {
      borderWidth: 2,
      borderColor: '#FFFFFF',
    }),
    ...(style as ViewStyle),
  };

  const textStyle: TextStyle = {
    fontSize: size * 0.4,
    fontWeight: '600',
    color: '#FFFFFF',
  };

  if (hasAvatar) {
    // Show user's avatar image
    return (
      <View style={containerStyle}>
        <CachedImage
          source={getImageSource(avatar)}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
          priority="normal"
          cache="immutable"
        />
      </View>
    );
  }

  // Show initials
  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{initials}</Text>
    </View>
  );
};

export default Avatar;

