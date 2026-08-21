import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type ActiveTripSessionStatus = 'ACTIVE' | 'ALERT_TRIGGERED';

export type ActiveTripSession = {
  safeTripId: string;
  status: ActiveTripSessionStatus;
  startedAt: string;
};

const ACTIVE_TRIP_SESSION_KEY = 'xguardiam.activeTripSession';

type WebStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export function sanitizeActiveTripSession(
  value: unknown,
): ActiveTripSession | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Record<keyof ActiveTripSession, unknown>>;

  if (typeof candidate.safeTripId !== 'string') {
    return null;
  }

  const safeTripId = candidate.safeTripId.trim();
  if (!safeTripId) {
    return null;
  }

  if (
    candidate.status !== 'ACTIVE' &&
    candidate.status !== 'ALERT_TRIGGERED'
  ) {
    return null;
  }

  if (typeof candidate.startedAt !== 'string') {
    return null;
  }

  const startedAt = candidate.startedAt.trim();
  if (!startedAt || Number.isNaN(Date.parse(startedAt))) {
    return null;
  }

  return {
    safeTripId,
    status: candidate.status,
    startedAt,
  };
}

export async function saveActiveTripSession(
  session: ActiveTripSession,
): Promise<boolean> {
  try {
    const sanitized = sanitizeActiveTripSession(session);

    if (!sanitized) {
      return false;
    }

    await setStorageItem(
      ACTIVE_TRIP_SESSION_KEY,
      JSON.stringify(sanitized),
    );

    return true;
  } catch {
    return false;
  }
}

export async function loadActiveTripSession(): Promise<ActiveTripSession | null> {
  try {
    const raw = await getStorageItem(ACTIVE_TRIP_SESSION_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    const sanitized = sanitizeActiveTripSession(parsed);

    if (!sanitized) {
      await clearActiveTripSession();
      return null;
    }

    return sanitized;
  } catch {
    await clearActiveTripSession();
    return null;
  }
}

export async function clearActiveTripSession(): Promise<boolean> {
  try {
    await removeStorageItem(ACTIVE_TRIP_SESSION_KEY);
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

async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    setWebStorageItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    removeWebStorageItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function getWebStorage(): WebStorageLike | null {
  const maybeGlobal = globalThis as typeof globalThis & {
    localStorage?: WebStorageLike;
  };

  return maybeGlobal.localStorage ?? null;
}

function getWebStorageItem(key: string): string | null {
  try {
    return getWebStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function setWebStorageItem(key: string, value: string): void {
  try {
    getWebStorage()?.setItem(key, value);
  } catch {
    // Storage can be unavailable in restricted web environments.
  }
}

function removeWebStorageItem(key: string): void {
  try {
    getWebStorage()?.removeItem(key);
  } catch {
    // Storage can be unavailable in restricted web environments.
  }
}