import type { TextStyle, ViewStyle } from 'react-native';

export type GuardiamV2ThemeMode = 'light' | 'dark';

export type GuardiamV2ResolvedThemeMode = 'light' | 'dark' | 'darkNavy' | 'critical';

export type GuardiamV2Theme = {
  mode: GuardiamV2ResolvedThemeMode;
  background: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderStrong: string;
  text: string;
  text2: string;
  text3: string;
  brand: string;
  brandSoft: string;
  active: string;
  activeSoft: string;
  warn: string;
  warnSoft: string;
  sos: string;
  sosSoft: string;
  darkNavy: string;
};

export const guardiamV2Themes: Record<GuardiamV2ThemeMode, GuardiamV2Theme> = {
  light: {
    mode: 'light',
    background: '#F4F7FC',
    surface: '#FFFFFF',
    surface2: '#F8FAFC',
    surface3: '#F1F5F9',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#0F172A',
    text2: '#475569',
    text3: '#94A3B8',
    brand: '#0F172A',
    brandSoft: '#F1F5F9',
    active: '#10B981',
    activeSoft: 'rgba(16, 185, 129, 0.12)',
    warn: '#F59E0B',
    warnSoft: 'rgba(245, 158, 11, 0.12)',
    sos: '#EF4444',
    sosSoft: 'rgba(239, 68, 68, 0.12)',
    darkNavy: '#0A1220',
  },
  dark: {
    mode: 'dark',
    background: '#111318',
    surface: '#181B21',
    surface2: '#20242C',
    surface3: '#252A33',
    border: '#2B313B',
    borderStrong: '#2B313B',
    text: '#F5F7FA',
    text2: '#A8B0BC',
    text3: '#727C8B',
    brand: '#2E8BFF',
    brandSoft: 'rgba(46,139,255,0.14)',
    active: '#2FD98A',
    activeSoft: 'rgba(47,217,138,0.14)',
    warn: '#FFC24B',
    warnSoft: 'rgba(255,194,75,0.14)',
    sos: '#FF5A5F',
    sosSoft: 'rgba(255,90,95,0.14)',
    darkNavy: '#0A1220',
  },
};

export const guardiamV2DarkNavy: GuardiamV2Theme = {
  mode: 'darkNavy',
  background: '#0A1220',
  surface: '#101B2E',
  surface2: '#16233B',
  surface3: '#1E3050',
  border: '#24344F',
  borderStrong: '#33486B',
  text: '#F5F8FF',
  text2: '#A9B7CE',
  text3: '#6B7C97',
  brand: '#2E8BFF',
  brandSoft: 'rgba(46,139,255,0.14)',
  active: '#2FD98A',
  activeSoft: 'rgba(47,217,138,0.14)',
  warn: '#FFC24B',
  warnSoft: 'rgba(255,194,75,0.14)',
  sos: '#FF5A5F',
  sosSoft: 'rgba(255,90,95,0.14)',
  darkNavy: '#0A1220',
};

export const guardiamV2Critical: GuardiamV2Theme = {
  mode: 'critical',
  background: '#EF4444',
  surface: '#DC2626',
  surface2: '#B91C1C',
  surface3: '#991B1B',
  border: '#F87171',
  borderStrong: '#FCA5A5',
  text: '#FFFFFF',
  text2: '#FEE2E2',
  text3: '#FECACA',
  brand: '#FFFFFF',
  brandSoft: 'rgba(255,255,255,0.2)',
  active: '#10B981',
  activeSoft: 'rgba(255,255,255,0.2)',
  warn: '#F59E0B',
  warnSoft: 'rgba(255,255,255,0.2)',
  sos: '#FFFFFF',
  sosSoft: 'rgba(255,255,255,0.2)',
  darkNavy: '#0A1220',
};

export const guardiamV2Radius = {
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const guardiamV2Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const guardiamV2Typography = {
  bodyFontFamily: 'Inter',
  displayFontFamily: 'Manrope',
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const },
  bodySemibold: { fontSize: 15, fontWeight: '600' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0, textTransform: 'uppercase' as const },
  title: { fontSize: 24, fontWeight: '700' as const },
  header: { fontSize: 18, fontWeight: '700' as const },
} satisfies Record<string, TextStyle | string>;

export const guardiamV2Shadows = {
  light: {
    sm: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    md: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
    lg: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 6 },
  },
  dark: {
    sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 1 },
    md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 30, elevation: 3 },
    lg: { shadowColor: '#000000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.45, shadowRadius: 40, elevation: 6 },
  },
  activeGlow: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.14, shadowRadius: 6, elevation: 0 },
  sosGlow: { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 10 },
} satisfies { light: Record<'sm' | 'md' | 'lg', ViewStyle>; dark: Record<'sm' | 'md' | 'lg', ViewStyle>; activeGlow: ViewStyle; sosGlow: ViewStyle };

export const getGuardiamV2Theme = (mode: GuardiamV2ThemeMode = 'light') => guardiamV2Themes[mode];
