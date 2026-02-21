import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../assets/images';
import { ONBOARDING_TITLE, ONBOARDING_SUBTITLE } from '../../config/onboardingConfig';
import { styles } from './styles';

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
        {/* Single onboarding image - fills space previously used by the grid */}
        <View style={styles.heroImageContainer}>
          <Image
            source={images.discoverNewClothes}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Content Section - edit text in src/config/onboardingConfig.ts */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{ONBOARDING_TITLE}</Text>
          <Text style={styles.description}>{ONBOARDING_SUBTITLE}</Text>
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
