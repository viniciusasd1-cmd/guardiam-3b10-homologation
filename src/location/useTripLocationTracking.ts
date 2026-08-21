import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { sendTripLocation, TripLocationInput } from '../api/safeTripsApi';
import {
  ForegroundLocationPermissionStatus,
  getCurrentLocation,
  isLocationPermissionGranted,
  requestForegroundLocationPermission,
  toTripLocationInput,
} from './locationService';
import {
  clearQueuedTripLocations,
  enqueueTripLocation,
  loadQueuedTripLocations,
  replaceQueuedTripLocations,
  type QueuedTripLocation,
} from './locationQueue';

const TRACKING_INTERVAL_MS = 15000;
const MAX_DRAIN_BATCH = 5;
const MAX_QUEUE_ATTEMPTS = 5;

type UseTripLocationTrackingOptions = {
  accessToken: string | null;
  safeTripId?: string | null;
  isTripActive: boolean;
};

function isAuthorizationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { statusCode?: unknown };
  return candidate.statusCode === 401 || candidate.statusCode === 403;
}

export function useTripLocationTracking({
  accessToken,
  safeTripId,
  isTripActive,
}: UseTripLocationTrackingOptions) {
  const [permissionStatus, setPermissionStatus] =
    useState<ForegroundLocationPermissionStatus>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<TripLocationInput | null>(
    null,
  );
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const permissionStatusRef =
    useRef<ForegroundLocationPermissionStatus>(null);
  const lastReportedAppStateRef = useRef<AppStateStatus | null>(null);
  const drainInProgressRef = useRef(false);

  const drainLocationQueue = useCallback(async () => {
    if (
      drainInProgressRef.current ||
      !safeTripId ||
      !accessToken ||
      !isTripActive
    ) {
      return;
    }

    drainInProgressRef.current = true;

    try {
      const queued = await loadQueuedTripLocations();
      const currentTrip = queued
        .filter((item) => item.safeTripId === safeTripId)
        .sort(
          (left, right) =>
            Date.parse(left.recordedAt) - Date.parse(right.recordedAt),
        );
      const currentBatch = currentTrip.slice(0, MAX_DRAIN_BATCH);
      const currentBatchIds = new Set(currentBatch.map((item) => item.id));
      const remaining = queued.filter((item) => !currentBatchIds.has(item.id));

      for (const item of currentBatch) {
        try {
          await sendTripLocation(accessToken, safeTripId, {
            lat: item.lat,
            lng: item.lng,
            latitude: item.lat,
            longitude: item.lng,
            accuracy: item.accuracy,
            speed: item.speed,
            heading: item.heading,
          });
        } catch (drainError) {
          if (isAuthorizationError(drainError)) {
            await clearQueuedTripLocations();
            setError(
              'Sessão expirada. Faça login novamente para enviar localização.',
            );
            return;
          }

          const attempts = item.attempts + 1;
          if (attempts < MAX_QUEUE_ATTEMPTS) {
            remaining.push({ ...item, attempts });
          }
        }
      }

      await replaceQueuedTripLocations(remaining);
    } finally {
      drainInProgressRef.current = false;
    }
  }, [accessToken, isTripActive, safeTripId]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      setError(null);
      const status = await requestForegroundLocationPermission();
      setPermissionStatus(status);
      permissionStatusRef.current = status;

      if (!isLocationPermissionGranted(status)) {
        setError('Permissão de localização negada. Ative a permissão do app para usar GPS real.');
      }

      return status;
    } catch {
      setError('Não foi possível solicitar permissão de localização.');
      return null;
    }
  }, []);

  const sendCurrentLocation = useCallback(async () => {
    if (!accessToken) {
      setError('Sessão expirada. Faça login novamente para enviar localização.');
      return null;
    }

    if (!safeTripId) {
      setError('Viagem sem ID. Não foi possível enviar localização.');
      return null;
    }

    if (!isTripActive) {
      setError('A viagem precisa estar ativa para enviar localização real.');
      stopTracking();
      return null;
    }

    if (!isLocationPermissionGranted(permissionStatusRef.current)) {
      setError('Permissão de localização não concedida.');
      return null;
    }

    let locationInput: TripLocationInput;
    try {
      setError(null);
      const currentLocation = await getCurrentLocation();
      locationInput = toTripLocationInput(currentLocation);
      setLastLocation(locationInput);
    } catch (captureError) {
      setError(
        captureError instanceof Error && captureError.message === 'LOCATION_SERVICES_DISABLED'
          ? 'O serviço de localização está desligado. Ative o GPS do dispositivo.'
          : 'Não foi possível obter uma posição GPS. Tente novamente em instantes.',
      );
      return null;
    }

    try {
      await sendTripLocation(accessToken, safeTripId, locationInput);
      setLastSentAt(new Date());
      void drainLocationQueue();
      return locationInput;
    } catch (sendError) {
      if (isAuthorizationError(sendError)) {
        await clearQueuedTripLocations();
        setError('Sessão expirada. Faça login novamente para enviar localização.');
        return null;
      }

      const queuedLocation: QueuedTripLocation = {
        id: `${safeTripId}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        safeTripId,
        lat: locationInput.lat,
        lng: locationInput.lng,
        accuracy: locationInput.accuracy,
        speed: locationInput.speed,
        heading: locationInput.heading,
        recordedAt: new Date().toISOString(),
        attempts: 1,
      };

      void enqueueTripLocation(queuedLocation);
      setError('A posição GPS foi obtida, mas não foi possível enviá-la.');
      return null;
    }
  }, [
    accessToken,
    drainLocationQueue,
    isTripActive,
    safeTripId,
    stopTracking,
  ]);

  const startTracking = useCallback(async () => {
    if (!isTripActive) {
      setError('Inicie a viagem antes de ativar o tracking real.');
      return false;
    }

    if (!safeTripId) {
      setError('Viagem sem ID. Não foi possível ativar tracking.');
      return false;
    }

    const status = isLocationPermissionGranted(permissionStatus)
      ? permissionStatus
      : await requestPermission();

    if (!isLocationPermissionGranted(status)) {
      return false;
    }

    void drainLocationQueue();

    if (intervalRef.current) {
      setIsTracking(true);
      return true;
    }

    const firstLocation = await sendCurrentLocation();
    if (!firstLocation) {
      return false;
    }

    setIsTracking(true);
    intervalRef.current = setInterval(() => {
      void sendCurrentLocation();
      if (!drainInProgressRef.current) {
        void drainLocationQueue();
      }
    }, TRACKING_INTERVAL_MS);

    return true;
  }, [
    drainLocationQueue,
    isTripActive,
    permissionStatus,
    requestPermission,
    safeTripId,
    sendCurrentLocation,
  ]);

  useEffect(() => {
    if (!isTripActive || !safeTripId) {
      stopTracking();
      void clearQueuedTripLocations();
    }
  }, [isTripActive, safeTripId, stopTracking]);

  useEffect(() => {
    if (!isTracking) {
      lastReportedAppStateRef.current = null;
      return;
    }

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          lastReportedAppStateRef.current = null;
          return;
        }

        if (
          (nextState === 'background' || nextState === 'inactive') &&
          lastReportedAppStateRef.current !== nextState
        ) {
          lastReportedAppStateRef.current = nextState;
          console.warn(
            '[LocationRuntime] Tracking foreground may pause while app is backgrounded.',
          );
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [isTracking]);

  useEffect(() => stopTracking, [stopTracking]);

  return {
    permissionStatus,
    isTracking,
    lastLocation,
    lastSentAt,
    error,
    requestPermission,
    sendCurrentLocation,
    startTracking,
    stopTracking,
  };
}