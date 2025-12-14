import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../assets/images';
import { styles } from './styles';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleStartNow = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Fashion Images Grid */}
        <View style={styles.imageGrid}>
          {/* Top large image */}
          <View style={styles.topImageContainer}>
            <View style={[styles.placeholderImage, styles.topImage]}>
              <Image source={images.image1} style={styles.mainImage} />
            </View>
          </View>
          
          {/* Middle row with left column (2 images) and right column (1 image) */}
          <View style={styles.middleRow}>
            {/* Left column with 2 images */}
            <View style={styles.leftColumn}>
              <View style={[styles.placeholderImage, styles.middleImage]}>
                <Image source={images.bagImage} style={styles.mainImage} />
              </View>
              <View style={[styles.placeholderImage, styles.middleImage]}>
                <Image source={images.jacket} style={styles.mainImage} />
              </View>
            </View>
            
            {/* Right column with 1 image */}
            <View style={styles.rightColumn}>
              <View style={[styles.placeholderImage, styles.rightImage]}>
                <Image source={images.shirtImage} style={styles.mainImage} />
              </View>
            </View>
          </View>
          
          {/* Bottom row with 2 images side by side */}
          <View style={styles.bottomRow}>
            <View style={[styles.placeholderImage, styles.bottomImage]}>
              <Image source={images.jeans} style={styles.mainImage} />
            </View>
            <View style={[styles.placeholderImage, styles.bottomImage]}>
              <Image source={images.coat} style={styles.mainImage} />
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>Discover New Clothes</Text>
          <Text style={styles.description}>
            Explore our online shopping experience and get everything you needed.
          </Text>
        </View>

        {/* Start Now Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartNow}>
          <Text style={styles.startButtonText}>Start Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OnboardingScreen;
