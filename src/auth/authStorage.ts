import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthSession } from '../types/auth';

const TOKEN_KEY = 'xguardiam.accessToken';
const USER_KEY = 'xguardiam.user';

type StorageKey = typeof TOKEN_KEY | typeof USER_KEY;

export async function saveSession(session: AuthSession) {
  await setStorageItem(TOKEN_KEY, session.accessToken);
  await setStorageItem(USER_KEY, JSON.stringify(session.user));
}

export async function loadSession(): Promise<AuthSession | null> {
  const [accessToken, userJson] = await Promise.all([
    getStorageItem(TOKEN_KEY),
    getStorageItem(USER_KEY),
  ]);

  if (!accessToken || !userJson) {
    return null;
  }

  try {
    return {
      accessToken,
      user: JSON.parse(userJson),
    };
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  await Promise.all([deleteStorageItem(TOKEN_KEY), deleteStorageItem(USER_KEY)]);
}

async function getStorageItem(key: StorageKey) {
  if (Platform.OS === 'web') {
    return getWebStorageItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setStorageItem(key: StorageKey, value: string) {
  if (Platform.OS === 'web') {
    setWebStorageItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStorageItem(key: StorageKey) {
  if (Platform.OS === 'web') {
    deleteWebStorageItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function getWebStorageItem(key: StorageKey) {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(key);
}

function setWebStorageItem(key: StorageKey, value: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, value);
}

function deleteWebStorageItem(key: StorageKey) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(key);
}