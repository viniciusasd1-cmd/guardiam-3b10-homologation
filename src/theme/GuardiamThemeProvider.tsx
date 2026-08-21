import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  guardiamV2Critical,
  guardiamV2DarkNavy,
  guardiamV2Themes,
  type GuardiamV2ResolvedThemeMode,
  type GuardiamV2Theme,
  type GuardiamV2ThemeMode,
} from './guardiamV2';
import { saveThemePreference } from './themeStorage';

export type GuardiamThemeResolutionInput = {
  userPreference: GuardiamV2ThemeMode;
  protectionActive: boolean;
  sosCritical: boolean;
};

export function resolveGuardiamTheme({
  userPreference,
  protectionActive,
  sosCritical,
}: GuardiamThemeResolutionInput): GuardiamV2Theme {
  if (sosCritical) {
    return guardiamV2Critical;
  }

  if (protectionActive) {
    return guardiamV2DarkNavy;
  }

  if (userPreference === 'dark') {
    return guardiamV2Themes.dark;
  }

  return guardiamV2Themes.light;
}

export type GuardiamThemeContextValue = {
  theme: GuardiamV2Theme;
  resolvedMode: GuardiamV2ResolvedThemeMode;
  userPreference: GuardiamV2ThemeMode;
  protectionActive: boolean;
  sosCritical: boolean;
  setUserPreference: (mode: GuardiamV2ThemeMode) => void;
  setProtectionActive: (active: boolean) => void;
  setSosCritical: (critical: boolean) => void;
};

const GuardiamThemeContext =
  createContext<GuardiamThemeContextValue | null>(null);

export type GuardiamThemeProviderProps = {
  children: ReactNode;
  initialUserPreference?: GuardiamV2ThemeMode;
  initialProtectionActive?: boolean;
  initialSosCritical?: boolean;
};

export function GuardiamThemeProvider({
  children,
  initialUserPreference = 'light',
  initialProtectionActive = false,
  initialSosCritical = false,
}: GuardiamThemeProviderProps) {
  const [userPreference, setUserPreferenceState] =
    useState<GuardiamV2ThemeMode>(initialUserPreference);

  const [protectionActive, setProtectionActive] =
    useState<boolean>(initialProtectionActive);

  const [sosCritical, setSosCritical] =
    useState<boolean>(initialSosCritical);

  const setUserPreference = useCallback(
    (mode: GuardiamV2ThemeMode) => {
      setUserPreferenceState(mode);
      void saveThemePreference(mode);
    },
    []
  );

  const theme = useMemo(
    () =>
      resolveGuardiamTheme({
        userPreference,
        protectionActive,
        sosCritical,
      }),
    [userPreference, protectionActive, sosCritical]
  );

  const resolvedMode = theme.mode;

  const value = useMemo<GuardiamThemeContextValue>(
    () => ({
      theme,
      resolvedMode,
      userPreference,
      protectionActive,
      sosCritical,
      setUserPreference,
      setProtectionActive,
      setSosCritical,
    }),
    [
      theme,
      resolvedMode,
      userPreference,
      protectionActive,
      sosCritical,
      setUserPreference,
    ]
  );

  return (
    <GuardiamThemeContext.Provider value={value}>
      {children}
    </GuardiamThemeContext.Provider>
  );
}

export function useGuardiamTheme(): GuardiamThemeContextValue {
  const context = useContext(GuardiamThemeContext);

  if (!context) {
    throw new Error(
      'useGuardiamTheme must be used within a GuardiamThemeProvider'
    );
  }

  return context;
}