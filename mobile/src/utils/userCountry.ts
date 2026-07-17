/**
 * Reads the signed-in user's selected country (code) from AsyncStorage.
 * Used to gate product/brand listings so users only see brands that serve
 * their country. Returns undefined for guests or users without a country.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserCountry = async (): Promise<string | undefined> => {
  try {
    const raw = await AsyncStorage.getItem('user');
    if (!raw) return undefined;
    const user = JSON.parse(raw);
    const c = user?.country;
    return typeof c === 'string' && c.trim() ? c.trim() : undefined;
  } catch {
    return undefined;
  }
};
