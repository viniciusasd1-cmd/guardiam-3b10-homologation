import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth/AuthContext';
import {
  GuardiamThemeProvider,
  useGuardiamTheme,
} from '../src/theme/GuardiamThemeProvider';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootThemeShell() {
  const { theme } = useGuardiamTheme();

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen
          name="(auth)/login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(auth)/register"
          options={{ title: 'Criar conta' }}
        />

        <Stack.Screen
          name="(app)/home"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(app)/trusted-contacts"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(app)/create-trip"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(app)/active-trip"
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontError) {
      console.error('[FontRuntime] Failed to load global fonts.', fontError);
    }

    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GuardiamThemeProvider>
      <RootThemeShell />
    </GuardiamThemeProvider>
  );
}
