import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth/AuthContext';
import { colors } from '../src/constants/colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Entrar' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Criar conta' }} />
        <Stack.Screen name="(app)/home" options={{ headerShown: false }} />
        <Stack.Screen
          name="(app)/trusted-contacts"
          options={{ title: 'Contatos de confianÃ§a' }}
        />
        <Stack.Screen
          name="(app)/create-trip"
          options={{ title: 'Ativar proteção' }}
        />
        <Stack.Screen
          name="(app)/active-trip"
          options={{ title: 'Modo Proteção' }}
        />
      </Stack>
    </AuthProvider>
  );
}

