/**
 * Stripe keys from client (Shehryar) only.
 * Publishable key (pk_live_...) — safe in app. Backend uses secret key (sk_live_...) in env.
 */
export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51SUscNRskfVvNPWwnz4gaZSCGWYA4t5zNfUUMIR4WYv1Isp4e78cPFiWjykbJ3IHsirBmPZmnByzBcvFmGTjuNBL00AKqCRTri';

export const MERCHANT_DISPLAY_NAME = 'Shopo';

/** Same as Android `applicationId` — must match iOS CFBundleURLSchemes / Android VIEW intent for Stripe redirects */
export const STRIPE_URL_SCHEME = 'com.fashionapp';

/** Payment Sheet uses this for 3DS / browser return; host must match AndroidManifest `<data android:host="..." />` */
export const STRIPE_RETURN_URL = `${STRIPE_URL_SCHEME}://safepay`;
