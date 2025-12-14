import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const SafeView: React.FC<SafeViewProps> = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  const defaultStyle: ViewStyle = {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: insets.top,
  };

  // Merge default styles with custom styles, allowing custom styles to override defaults
  const mergedStyle = [defaultStyle, style];

  return (
    <View style={mergedStyle}>
      {children}
    </View>
  );
};

export default SafeView;
