import { Mail, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/auth/AuthContext';
import { ApprovedButton, ApprovedInput, ApprovedLogo } from '../../src/components/ui';
import { useGuardiamTheme } from '../../src/theme/GuardiamThemeProvider';
import { guardiamV2Radius, guardiamV2Spacing, guardiamV2Typography } from '../../src/theme/guardiamV2';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { theme, resolvedMode } = useGuardiamTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRegister() {
    if (loading) return;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(app)/home');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
              <Text style={[styles.tagline, { color: theme.text2 }]}>Crie sua conta para ativar a proteção</Text>
            </View>

            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ApprovedInput label="Nome completo" leftIcon={<User color={theme.text3} size={19} />} value={name} onChangeText={(value) => { setName(value); setErrorMessage(null); }} placeholder="Seu nome" autoCapitalize="words" returnKeyType="next" inputStyle={{ color: theme.text }} style={styles.input} />
              <ApprovedInput label="E-mail" leftIcon={<Mail color={theme.text3} size={19} />} value={email} onChangeText={(value) => { setEmail(value); setErrorMessage(null); }} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" returnKeyType="next" inputStyle={{ color: theme.text }} style={styles.input} />
              <ApprovedInput label="Senha" value={password} onChangeText={(value) => { setPassword(value); setErrorMessage(null); }} placeholder="••••••••" isPassword autoCapitalize="none" returnKeyType="done" onSubmitEditing={() => void handleRegister()} inputStyle={{ color: theme.text }} style={styles.input} />
              {errorMessage ? <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: theme.sos }]}>{errorMessage}</Text> : null}
              <ApprovedButton isLoading={loading} onPress={() => void handleRegister()} size="lg" style={styles.button}>Criar conta</ApprovedButton>
              <ApprovedButton disabled={loading} onPress={() => router.replace('/(auth)/login')} size="lg" variant="outline" style={styles.button}>Já tem conta? Entrar</ApprovedButton>
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
  tagline: { ...guardiamV2Typography.body, fontFamily: 'Manrope_400Regular', marginTop: guardiamV2Spacing.sm, textAlign: 'center' },
  formCard: { borderRadius: guardiamV2Radius.lg, borderWidth: 1, padding: guardiamV2Spacing.lg },
  input: { marginBottom: guardiamV2Spacing.md },
  button: { borderRadius: guardiamV2Radius.md, marginTop: guardiamV2Spacing.sm },
  errorText: { fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 18, marginBottom: guardiamV2Spacing.sm },
  footer: { fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 18, marginTop: guardiamV2Spacing.xl, textAlign: 'center' },
});