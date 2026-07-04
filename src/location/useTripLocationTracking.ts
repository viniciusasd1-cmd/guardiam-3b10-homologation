import { useCallback, useEffect, useRef, useState } from 'react';
import { sendTripLocation, TripLocationInput } from '../api/safeTripsApi';
import {
  ForegroundLocationPermissionStatus,
  getCurrentLocation,
  isLocationPermissionGranted,
  requestForegroundLocationPermission,
  toTripLocationInput,
} from './locationService';

const TRACKING_INTERVAL_MS = 15000;

type UseTripLocationTrackingOptions = {
  accessToken: string | null;
  safeTripId?: string | null;
  isTripActive: boolean;
};

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

    try {
      setError(null);
      const currentLocation = await getCurrentLocation();
      const locationInput = toTripLocationInput(currentLocation);

      await sendTripLocation(accessToken, safeTripId, locationInput);

      setLastLocation(locationInput);
      setLastSentAt(new Date());

      return locationInput;
    } catch {
      setError('Não foi possível capturar ou enviar a localização atual.');
      return null;
    }
  }, [
    accessToken,
    isTripActive,
    permissionStatus,
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

    if (intervalRef.current) {
      setIsTracking(true);
      return true;
    }

    setIsTracking(true);
    await sendCurrentLocation();

    intervalRef.current = setInterval(() => {
      void sendCurrentLocation();
    }, TRACKING_INTERVAL_MS);

    return true;
  }, [
    isTripActive,
    permissionStatus,
    requestPermission,
    safeTripId,
    sendCurrentLocation,
  ]);

  useEffect(() => {
    if (!isTripActive) {
      stopTracking();
    }
  }, [isTripActive, stopTracking]);

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
