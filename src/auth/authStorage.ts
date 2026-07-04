import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types/auth';

const TOKEN_KEY = 'xguardiam.accessToken';
const USER_KEY = 'xguardiam.user';

export async function saveSession(user: AuthUser, accessToken: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadSession() {
  const [accessToken, userJson] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (!accessToken || !userJson) {
    return null;
  }

  try {
    return {
      accessToken,
      user: JSON.parse(userJson) as AuthUser,
    };
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
