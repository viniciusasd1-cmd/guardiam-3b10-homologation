import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { GuardiamV2ThemeMode } from './guardiamV2';

const THEME_PREFERENCE_KEY = 'xguardiam.themePreference';

type WebStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function sanitizeThemePreference(
  value: unknown
): GuardiamV2ThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}

export async function loadThemePreference(): Promise<GuardiamV2ThemeMode> {
  try {
    const raw = await getStorageItem(THEME_PREFERENCE_KEY);
    return sanitizeThemePreference(raw);
  } catch {
    return 'light';
  }
}

export async function saveThemePreference(
  mode: GuardiamV2ThemeMode
): Promise<boolean> {
  try {
    const normalized = sanitizeThemePreference(mode);
    await setStorageItem(THEME_PREFERENCE_KEY, normalized);
    return true;
  } catch {
    return false;
  }
}

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorageItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setStorageItem(
  key: string,
  value: string
): Promise<void> {
  if (Platform.OS === 'web') {
    setWebStorageItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

function getWebStorage(): WebStorageLike | null {
  const maybeGlobal = globalThis as typeof globalThis & {
    localStorage?: WebStorageLike;
  };

  return maybeGlobal.localStorage ?? null;
}

function getWebStorageItem(key: string): string | null {
  return getWebStorage()?.getItem(key) ?? null;
}

function setWebStorageItem(key: string, value: string): void {
  const storage = getWebStorage();

  if (!storage) {
    throw new Error('Web storage is unavailable.');
  }

  storage.setItem(key, value);
}