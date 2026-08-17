import * as Crypto from 'expo-crypto';

export function createEventId(): string {
  return Crypto.randomUUID();
}
