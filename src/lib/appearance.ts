import Storage from 'expo-sqlite/kv-store';
import { Appearance } from 'react-native';

export type AppearancePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'appearance';

// Cream-and-green is Celiax's signature look, so it's the default.
export const DEFAULT_APPEARANCE: AppearancePreference = 'light';

/** Reads the saved preference from the phone's storage. */
export function getAppearancePreference(): AppearancePreference {
  const saved = Storage.getItemSync(STORAGE_KEY);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : DEFAULT_APPEARANCE;
}

/** Saves the preference and applies it to the whole app immediately. */
export function setAppearancePreference(preference: AppearancePreference) {
  Storage.setItemSync(STORAGE_KEY, preference);
  applyAppearance(preference);
}

export function applyAppearance(preference: AppearancePreference) {
  // 'unspecified' removes our override, so the app follows the iPhone's setting.
  // (Newer React Native versions rename this to 'auto'.)
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}
