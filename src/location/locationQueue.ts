import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const LOCATION_QUEUE_KEY = 'xguardiam.locationQueue';
const MAX_QUEUE_SIZE = 100;

export type QueuedTripLocation = {
  id: string;
  safeTripId: string;
  lat: number;
  lng: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  recordedAt: string;
  attempts: number;
};

type WebStorageLike = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

export function sanitizeQueuedTripLocation(
  value: unknown,
): QueuedTripLocation | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<
    Record<keyof QueuedTripLocation, unknown>
  >;

  if (typeof candidate.id !== 'string') {
    return null;
  }

  const id = candidate.id.trim();
  if (!id) {
    return null;
  }

  if (typeof candidate.safeTripId !== 'string') {
    return null;
  }

  const safeTripId = candidate.safeTripId.trim();
  if (!safeTripId) {
    return null;
  }

  if (!isValidLatitude(candidate.lat)) {
    return null;
  }

  if (!isValidLongitude(candidate.lng)) {
    return null;
  }

  if (typeof candidate.recordedAt !== 'string') {
    return null;
  }

  const recordedAt = candidate.recordedAt.trim();
  if (!recordedAt || Number.isNaN(Date.parse(recordedAt))) {
    return null;
  }

  if (
    typeof candidate.attempts !== 'number' ||
    !Number.isInteger(candidate.attempts) ||
    candidate.attempts < 0
  ) {
    return null;
  }

  const accuracy = sanitizeOptionalNumber(candidate.accuracy);
  const speed = sanitizeOptionalNumber(candidate.speed);
  const heading = sanitizeOptionalNumber(candidate.heading);

  if (accuracy === false || speed === false || heading === false) {
    return null;
  }

  return {
    id,
    safeTripId,
    lat: candidate.lat,
    lng: candidate.lng,
    ...(accuracy !== undefined ? { accuracy } : {}),
    ...(speed !== undefined ? { speed } : {}),
    ...(heading !== undefined ? { heading } : {}),
    recordedAt,
    attempts: candidate.attempts,
  };
}

export async function enqueueTripLocation(
  item: QueuedTripLocation,
): Promise<boolean> {
  try {
    const sanitized = sanitizeQueuedTripLocation(item);

    if (!sanitized) {
      return false;
    }

    const current = await loadQueuedTripLocations();

    return replaceQueuedTripLocations([...current, sanitized]);
  } catch {
    return false;
  }
}

export async function loadQueuedTripLocations(): Promise<QueuedTripLocation[]> {
  try {
    const raw = await getStorageItem(LOCATION_QUEUE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      await clearQueuedTripLocations();
      return [];
    }

    const sanitized = parsed
      .map((item) => sanitizeQueuedTripLocation(item))
      .filter((item): item is QueuedTripLocation => item !== null)
      .slice(-MAX_QUEUE_SIZE);

    if (sanitized.length !== parsed.length) {
      await replaceQueuedTripLocations(sanitized);
    }

    return sanitized;
  } catch {
    await clearQueuedTripLocations();
    return [];
  }
}

export async function replaceQueuedTripLocations(
  items: QueuedTripLocation[],
): Promise<boolean> {
  try {
    const sanitized = items
      .map((item) => sanitizeQueuedTripLocation(item))
      .filter((item): item is QueuedTripLocation => item !== null)
      .slice(-MAX_QUEUE_SIZE);

    await setStorageItem(LOCATION_QUEUE_KEY, JSON.stringify(sanitized));

    return true;
  } catch {
    return false;
  }
}

export async function clearQueuedTripLocations(): Promise<boolean> {
  try {
    await removeStorageItem(LOCATION_QUEUE_KEY);
    return true;
  } catch {
    return false;
  }
}

function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}

function sanitizeOptionalNumber(
  value: unknown,
): number | null | undefined | false {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }

  return value;
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