import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Dimensions,
  BackHandler,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.85;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  enablePanDownToClose?: boolean;
  enableBackdropToClose?: boolean;
  backdropColor?: string;
  backdropOpacity?: number;
  maxHeight?: number;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  enablePanDownToClose = true,
  enableBackdropToClose = true,
  backdropColor = '#000000',
  backdropOpacity = 0.5,
  maxHeight = MAX_HEIGHT,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(500); // off-screen initially
  const backdropOpacityValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacityValue.value,
  }));

  const showSheet = () => {
    translateY.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
    backdropOpacityValue.value = withTiming(backdropOpacity, { duration: 200 });
  };

  const hideSheet = () => {
    'worklet';
    translateY.value = withTiming(500, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });
    backdropOpacityValue.value = withTiming(0, { duration: 250 }, () => {
        scheduleOnRN(setModalVisible,false);
        scheduleOnRN(onClose);
    });
  };

  const handleBackdropPress = () => {
    if (enableBackdropToClose) {
      hideSheet();
    }
  };

  // Handle hardware back press
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        hideSheet();
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible]);

  // Fixed gesture for Android compatibility
  const handleGesture = Gesture.Pan()
    .activeOffsetY(10) // Add threshold for activation
    .failOffsetY(-10) // Prevent upward gestures from activating
    .minDistance(0) // Allow immediate response
    .enabled(enablePanDownToClose)
    .onUpdate(e => {
      'worklet';
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(e => {
      'worklet';
      if (e.translationY > 100 || e.velocityY > 500) {
        hideSheet();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
    } else if (modalVisible) {
      hideSheet();
    }
  }, [visible]);

  // Show animation when modal becomes visible
  useEffect(() => {
    if (modalVisible && visible) {
      showSheet();
    }
  }, [modalVisible, visible]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      translateY.value = 500;
      backdropOpacityValue.value = 0;
    };
  }, []);

  return (
    <Modal
      transparent
      animationType='none'
      visible={modalVisible}
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <GestureHandlerRootView style={styles.modalWrapper}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, { backgroundColor: backdropColor }, backdropStyle]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheetContainer,
            animatedStyle,
            { maxHeight: maxHeight },
          ]}
        >
          {/* Handle Area */}
          <GestureDetector gesture={handleGesture}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          {/* Content */}
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 150,
    maxHeight: MAX_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
});

export default BottomSheet;
