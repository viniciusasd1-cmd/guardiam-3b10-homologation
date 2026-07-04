import { apiRequest, unwrapData } from './apiClient';
import { CreateSafeTripInput, SafeTrip } from '../types/safeTrip';

export type TripLocationInput = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
};

type SingleTripResponse = {
  status: string;
  resource: string;
  data: SafeTrip;
};

export async function createSafeTrip(token: string, input: CreateSafeTripInput) {
  const response = await apiRequest<SingleTripResponse>('/safe-trips', {
    method: 'POST',
    token,
    body: input,
  });
  return unwrapData(response);
}

export async function getSafeTrip(token: string, safeTripId: string) {
  const response = await apiRequest<SingleTripResponse>(
    `/safe-trips/${safeTripId}`,
    { token },
  );
  return unwrapData(response);
}

export async function getActiveTrip(token: string) {
  const response = await apiRequest<SingleTripResponse>('/safe-trips/active', {
    token,
  });
  return unwrapData(response);
}

export async function startTrip(token: string, safeTripId: string) {
  const response = await apiRequest<SingleTripResponse>(
    `/safe-trips/${safeTripId}/start`,
    {
      method: 'POST',
      token,
    },
  );
  return unwrapData(response);
}

export async function completeTrip(token: string, safeTripId: string) {
  const response = await apiRequest<SingleTripResponse>(
    `/safe-trips/${safeTripId}/complete`,
    {
      method: 'POST',
      token,
    },
  );
  return unwrapData(response);
}

export async function sendTripLocation(
  token: string,
  safeTripId: string,
  location?: TripLocationInput,
) {
  return apiRequest<{ status: string; resource: string; data: unknown }>(
    `/safe-trips/${safeTripId}/locations`,
    {
      method: 'POST',
      token,
      body:
        location ?? {
          lat: -23.55052,
          lng: -46.633308,
          speed: 24,
          accuracy: 12,
          batteryLevel: 86,
          recordedAt: new Date().toISOString(),
        },
    },
  );
}

export async function triggerPanicAlert(token: string, safeTripId: string) {
  return apiRequest<{ status: string; resource: string; data: unknown }>(
    `/safe-trips/${safeTripId}/alerts`,
    {
      method: 'POST',
      token,
      body: {
        triggerType: 'MANUAL',
        message: 'Alerta silencioso acionado pelo app',
      },
    },
  );
}
