import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authApi from '../api/authApi';
import { AuthUser } from '../types/auth';
import { clearSession, loadSession, saveSession } from './authStorage';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession()
      .then((session) => {
        if (session) {
          setUser(session.user);
          setAccessToken(session.accessToken);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleLogin(email: string, password: string) {
    const response = await authApi.login({ email, password });
    await saveSession(response.user, response.accessToken);
    setUser(response.user);
    setAccessToken(response.accessToken);
  }

  async function handleRegister(name: string, email: string, password: string) {
    const response = await authApi.register({ name, email, password });
    await saveSession(response.user, response.accessToken);
    setUser(response.user);
    setAccessToken(response.accessToken);
  }

  async function handleLogout() {
    await clearSession();
    setUser(null);
    setAccessToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [accessToken, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
