/**
 * Stripe keys from client (Shehryar) only.
 * Publishable key (pk_live_...) — safe in app. Backend uses secret key (sk_live_...) in env.
 */
export const STRIPE_PUBLISHABLE_KEY =
  'pk_live_51SUscNRskfVvNPWwWzsDBnLl7kF0ZG9VYKceO8buSRX7NRvc2q3lsEvdDOIw5SC9PQKVv70sI27kbyiLwnlpv5td001dLcE24e';

export const MERCHANT_DISPLAY_NAME = 'Shopo';

/** Same as Android `applicationId` — must match iOS CFBundleURLSchemes / Android VIEW intent for Stripe redirects */
export const STRIPE_URL_SCHEME = 'com.fashionapp';

/** Payment Sheet uses this for 3DS / browser return; host must match AndroidManifest `<data android:host="..." />` */
export const STRIPE_RETURN_URL = `${STRIPE_URL_SCHEME}://safepay`;
