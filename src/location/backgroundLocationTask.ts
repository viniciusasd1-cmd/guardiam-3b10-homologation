import * as TaskManager from 'expo-task-manager';
import type * as Location from 'expo-location';
import { sendTripLocation } from '../api/safeTripsApi';
import { getBackgroundAccessToken } from '../auth/authStorage';
import {
  clearActiveTripSession,
  loadActiveTripSession,
} from './activeTripSessionStorage';
import { enqueueTripLocation } from './locationQueue';

export const GUARDIAM_BACKGROUND_LOCATION_TASK =
  'GUARDIAM_BACKGROUND_LOCATION_TASK';

type BackgroundLocationData = {
  locations?: Location.LocationObject[];
};

type LocationError = {
  statusCode?: unknown;
};

function isAuthorizationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as LocationError;
  return candidate.statusCode === 401 || candidate.statusCode === 403;
}

function isValidNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function getLocationInput(location: Location.LocationObject) {
  const { coords } = location;

  if (!isValidNumber(coords.latitude) || !isValidNumber(coords.longitude)) {
    return null;
  }

  return {
    lat: coords.latitude,
    lng: coords.longitude,
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    speed: coords.speed,
    heading: coords.heading,
  };
}

TaskManager.defineTask(
  GUARDIAM_BACKGROUND_LOCATION_TASK,
  async ({ data, error }) => {
    try {
      if (error) {
        console.warn('[LocationTask] Background location task reported an error.');
        return;
      }

      const session = await loadActiveTripSession();
      const accessToken = await getBackgroundAccessToken();

      if (!session || !accessToken) {
        return;
      }

      if (session.status !== 'ACTIVE' && session.status !== 'ALERT_TRIGGERED') {
        return;
      }

      if (!data || typeof data !== 'object') {
        return;
      }

      const locations = (data as BackgroundLocationData).locations;
      if (!Array.isArray(locations)) {
        return;
      }

      for (const location of locations) {
        const input = getLocationInput(location);
        if (!input) {
          continue;
        }

        const recordedAt = new Date(
          typeof location.timestamp === 'number' && Number.isFinite(location.timestamp)
            ? location.timestamp
            : Date.now(),
        ).toISOString();
        const id = `${session.safeTripId}:${recordedAt}:${Math.random().toString(36).slice(2)}`;

        try {
          await sendTripLocation(accessToken, session.safeTripId, input);
        } catch (sendError) {
          if (isAuthorizationError(sendError)) {
            await clearActiveTripSession();
            return;
          }

          await enqueueTripLocation({
            id,
            safeTripId: session.safeTripId,
            lat: input.lat,
            lng: input.lng,
            accuracy: input.accuracy,
            speed: input.speed,
            heading: input.heading,
            recordedAt,
            attempts: 1,
          });
        }
      }
    } catch (taskError) {
      console.warn('[LocationTask] Background location task failed.', taskError);
    }
  },
);