import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'xguardiam.accessToken';
const USER_KEY = 'xguardiam.user';

type StorageKey = typeof TOKEN_KEY | typeof USER_KEY;

type WebStorageLike = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

export type StoredAuthSession<TUser = any> = {
  accessToken: string;
  user: TUser;
};

export async function saveSession<TUser>(user: TUser, accessToken: string) {
  await Promise.all([
    setStorageItem(TOKEN_KEY, accessToken),
    setStorageItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function loadSession<TUser = any>(): Promise<StoredAuthSession<TUser> | null> {
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
      user: JSON.parse(userJson) as TUser,
    };
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  await Promise.all([
    deleteStorageItem(TOKEN_KEY),
    deleteStorageItem(USER_KEY),
  ]);
}

export async function getBackgroundAccessToken(): Promise<string | null> {
  try {
    const accessToken = await getStorageItem(TOKEN_KEY);
    const normalized = accessToken?.trim();

    return normalized ? normalized : null;
  } catch {
    return null;
  }
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

function getWebStorage() {
  const maybeGlobal = globalThis as typeof globalThis & {
    localStorage?: WebStorageLike;
  };

  return maybeGlobal.localStorage ?? null;
}

function getWebStorageItem(key: StorageKey) {
  return getWebStorage()?.getItem(key) ?? null;
}

function setWebStorageItem(key: StorageKey, value: string) {
  getWebStorage()?.setItem(key, value);
}

function deleteWebStorageItem(key: StorageKey) {
  getWebStorage()?.removeItem(key);
}