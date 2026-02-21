/**
 * Onboarding screens configuration
 * Replace images and text here when you have the final assets.
 * Add images to src/assets/images and reference them below.
 */

import images from '../assets/images';

export interface OnboardingSlide {
  image: any;
  title: string;
  subtitle: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    image: images.image1,
    title: 'Discover New Clothes',
    subtitle: 'Explore our online shopping experience and get everything you needed.',
  },
  // Add more slides when you have images, e.g.:
  // { image: images.yourImage, title: 'Your Title', subtitle: 'Your subtitle.' },
];

/** Single-screen fallback (current app uses one screen) */
export const ONBOARDING_TITLE = 'Discover New Clothes';
export const ONBOARDING_SUBTITLE =
  'Explore our online shopping experience and get everything you needed.';
export const ONBOARDING_MAIN_IMAGE = images.image1;
