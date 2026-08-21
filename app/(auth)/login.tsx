import { Lock, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/auth/AuthContext';
import { ApprovedButton, ApprovedInput, ApprovedLogo } from '../../src/components/ui';
import { useGuardiamTheme } from '../../src/theme/GuardiamThemeProvider';
import { guardiamV2Radius, guardiamV2Spacing, guardiamV2Typography } from '../../src/theme/guardiamV2';

export default function LoginScreen() {
  const { theme, resolvedMode } = useGuardiamTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    if (loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password);
      router.replace('/(app)/home');
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      Alert.alert('Não foi possível entrar', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.hero}>
              <ApprovedLogo size="lg" />
              <Text style={[styles.brand, { color: theme.text }]}>GUARDIAM</Text>
              <Text style={[styles.tagline, { color: theme.text2 }]}>Sua segurança começa aqui.</Text>
            </View>

            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ApprovedInput
                label="E-mail"
                leftIcon={<Mail color={theme.text3} size={19} />}
                value={email}
                onChangeText={(value) => { setEmail(value); setErrorMessage(null); }}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                inputStyle={{ color: theme.text }}
                style={styles.input}
              />
              <ApprovedInput
                label="Senha"
                leftIcon={<Lock color={theme.text3} size={19} />}
                value={password}
                onChangeText={(value) => { setPassword(value); setErrorMessage(null); }}
                placeholder="••••••••"
                isPassword
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => void handleLogin()}
                inputStyle={{ color: theme.text }}
                style={styles.input}
              />
              {errorMessage ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: theme.sos }]}>{errorMessage}</Text> : null}
              <ApprovedButton isLoading={loading} onPress={() => void handleLogin()} size="lg" style={styles.button}>
                Entrar
              </ApprovedButton>
              <ApprovedButton disabled={loading} onPress={() => router.push('/(auth)/register')} size="lg" variant="outline" style={styles.button}>
                Criar cadastro
              </ApprovedButton>
            </View>

            <Text style={[styles.footer, { color: theme.text3 }]}>Protegido de ponta a ponta · Discreto e confiável</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente em instantes.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, minHeight: '100%', justifyContent: 'center', paddingHorizontal: guardiamV2Spacing.lg, paddingVertical: guardiamV2Spacing.lg },
  hero: { alignItems: 'center', marginBottom: guardiamV2Spacing.xl },
  brand: { ...guardiamV2Typography.title, fontFamily: 'Manrope_800ExtraBold', marginTop: guardiamV2Spacing.md },
  tagline: { ...guardiamV2Typography.body, fontFamily: 'Manrope_400Regular', marginTop: guardiamV2Spacing.sm },
  formCard: { borderRadius: guardiamV2Radius.lg, borderWidth: 1, padding: guardiamV2Spacing.lg },
  input: { marginBottom: guardiamV2Spacing.md },
  button: { borderRadius: guardiamV2Radius.md, marginTop: guardiamV2Spacing.sm },
  errorText: { fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 18, marginBottom: guardiamV2Spacing.sm },
  footer: { fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 18, marginTop: guardiamV2Spacing.xl, textAlign: 'center' },
});