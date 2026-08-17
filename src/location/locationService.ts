import * as Location from 'expo-location';
import { TripLocationInput } from '../api/safeTripsApi';

export type ForegroundLocationPermissionStatus = Location.PermissionStatus | null;

export async function requestForegroundLocationPermission() {
  const permission = await Location.requestForegroundPermissionsAsync();
  return permission.status;
}

export async function getCurrentLocation() {
  if (!(await Location.hasServicesEnabledAsync())) {
    throw new Error('LOCATION_SERVICES_DISABLED');
  }

  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}

export function toTripLocationInput(
  location: Location.LocationObject,
): TripLocationInput {
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    altitude: location.coords.altitude,
    speed: location.coords.speed,
    heading: location.coords.heading,
  };
}

export function isLocationPermissionGranted(
  status: ForegroundLocationPermissionStatus,
) {
  return status === Location.PermissionStatus.GRANTED;
}
