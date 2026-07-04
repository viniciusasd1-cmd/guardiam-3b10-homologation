export type TripType =
  | 'RIDE_APP'
  | 'TAXI'
  | 'TRANSFER'
  | 'HOTEL'
  | 'TOURISM'
  | 'LOCAL_TRIP'
  | 'OTHER';

export type TripStatus =
  | 'DRAFT'
  | 'PREPARING'
  | 'ACTIVE'
  | 'ALERT_TRIGGERED'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type SafeTrip = {
  id: string;
  tripType: TripType;
  status: TripStatus;
  originAddress: string | null;
  destinationAddress: string | null;
  destinationName: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
};

export type CreateSafeTripInput = {
  tripType?: TripType;
  originAddress?: string;
  destinationAddress?: string;
  destinationName?: string;
};
