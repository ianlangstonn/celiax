import { Appearance } from 'react-native';

// Web version of appearance.ts. The iPhone app saves the setting with
// expo-sqlite; in a browser we use the built-in localStorage instead.

export type AppearancePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'appearance';

export const DEFAULT_APPEARANCE: AppearancePreference = 'light';

export function getAppearancePreference(): AppearancePreference {
  const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : DEFAULT_APPEARANCE;
}

export function setAppearancePreference(preference: AppearancePreference) {
  localStorage.setItem(STORAGE_KEY, preference);
  applyAppearance(preference);
}

export function applyAppearance(preference: AppearancePreference) {
  // React Native Web can't override the color scheme, so the browser's setting wins.
  if (typeof Appearance.setColorScheme === 'function') {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }
}
