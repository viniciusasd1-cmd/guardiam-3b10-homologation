import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/auth/AuthContext';
import {
  useGuardiamTheme,
} from '../../src/theme/GuardiamThemeProvider';
import {
  guardiamV2Radius,
  guardiamV2Spacing,
  guardiamV2Typography,
} from '../../src/theme/guardiamV2';

export default function LoginScreen() {
  const { theme, resolvedMode } = useGuardiamTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
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

  const inputBorder = focusedField ? theme.text : theme.border;
  const inputBorderWidth = focusedField ? 2 : 1;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { backgroundColor: theme.background }]}>
            <View style={styles.hero} accessibilityRole="header">
              <View
                style={[
                  styles.shield,
                  {
                    backgroundColor: theme.brand,
                    borderRadius: guardiamV2Radius.md,
                  },
                ]}
              >
                <Shield size={32} color={theme.background} strokeWidth={2.2} />
              </View>
              <Text style={[styles.brand, { color: theme.text }]}>GUARDIAM</Text>
              <Text style={[styles.tagline, { color: theme.text2 }]}>Sua segurança começa aqui.</Text>
            </View>

            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderRadius: guardiamV2Radius.lg,
                },
              ]}
            >
              <View>
                <Text style={[styles.label, { color: theme.text2 }]}>E-mail</Text>
                <View
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.surface2,
                      borderColor: focusedField === 'email' ? theme.text : theme.border,
                      borderWidth: focusedField === 'email' ? 2 : 1,
                      borderRadius: guardiamV2Radius.md,
                    },
                    errorMessage && { backgroundColor: theme.sosSoft, borderColor: theme.sos },
                  ]}
                >
                  <Mail size={19} color={theme.text3} strokeWidth={2} />
                  <TextInput
                    accessibilityLabel="E-mail"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="seu@email.com"
                    placeholderTextColor={theme.text3}
                    returnKeyType="next"
                    value={email}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => { setEmail(value); setErrorMessage(null); }}
                    onFocus={() => setFocusedField('email')}
                    style={[styles.input, { color: theme.text }]}
                  />
                </View>
              </View>

              <View style={styles.passwordGroup}>
                <Text style={[styles.label, { color: theme.text2 }]}>Senha</Text>
                <View
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.surface2,
                      borderColor: focusedField === 'password' ? theme.text : theme.border,
                      borderWidth: focusedField === 'password' ? 2 : 1,
                      borderRadius: guardiamV2Radius.md,
                    },
                    errorMessage && { backgroundColor: theme.sosSoft, borderColor: theme.sos },
                  ]}
                >
                  <Lock size={19} color={theme.text3} strokeWidth={2} />
                  <TextInput
                    accessibilityLabel="Senha"
                    autoCapitalize="none"
                    autoComplete="password"
                    placeholder="••••••••"
                    placeholderTextColor={theme.text3}
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    value={password}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => { setPassword(value); setErrorMessage(null); }}
                    onFocus={() => setFocusedField('password')}
                    onSubmitEditing={() => void handleLogin()}
                    style={[styles.passwordInput, { color: theme.text }]}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showPassword }}
                    hitSlop={10}
                    onPress={() => setShowPassword((visible) => !visible)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={18} color={theme.text3} /> : <Eye size={18} color={theme.text3} />}
                  </Pressable>
                </View>
              </View>

              {errorMessage ? (
                <View accessibilityLiveRegion="polite" style={styles.errorBox}>
                  <Text style={[styles.errorText, { color: theme.sos }]}>{errorMessage}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: loading, busy: loading }}
                disabled={loading}
                onPress={() => void handleLogin()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.brand, borderRadius: guardiamV2Radius.md },
                  pressed && !loading && styles.pressed,
                  loading && styles.disabled,
                ]}
              >
                {loading ? <ActivityIndicator size="small" color={theme.background} /> : <Text style={[styles.primaryText, { color: theme.background }]}>Entrar</Text>}
              </Pressable>

              <Pressable
                accessibilityLabel="Criar cadastro"
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
                disabled={loading}
                onPress={() => router.push('/(auth)/register')}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: theme.borderStrong, borderRadius: guardiamV2Radius.md },
                  pressed && styles.pressed,
                  loading && styles.disabled,
                ]}
              >
                <Text style={[styles.secondaryText, { color: theme.text }]}>Criar cadastro</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.text3 }]}>Protegido de ponta a ponta · Discreto e confiável</Text>
            </View>
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
  content: {
    flexGrow: 1,
    minHeight: '100%',
    paddingHorizontal: guardiamV2Spacing.lg,
    justifyContent: 'center',
    paddingVertical: guardiamV2Spacing.lg,
  },
  hero: { alignItems: 'center', marginBottom: guardiamV2Spacing.xl },
  shield: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: guardiamV2Spacing.md,
  },
  brand: {
    ...guardiamV2Typography.title,
    fontFamily: 'Manrope_800ExtraBold',
    marginBottom: guardiamV2Spacing.sm,
  },
  tagline: {
    ...guardiamV2Typography.body,
    fontFamily: 'Manrope_400Regular',
  },
  formCard: {
    width: '100%',
    padding: guardiamV2Spacing.lg,
    borderWidth: 1,
  },
  label: {
    ...guardiamV2Typography.label,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: guardiamV2Spacing.sm,
  },
  inputField: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: guardiamV2Spacing.md,
  },
  passwordGroup: { marginTop: guardiamV2Spacing.md },
  input: {
    flex: 1,
    height: 56,
    marginLeft: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
  },
  passwordInput: {
    flex: 1,
    height: 56,
    marginLeft: 12,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
  },
  eyeButton: { width: 32, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: guardiamV2Spacing.sm },
  errorBox: { paddingHorizontal: 3, marginTop: 2 },
  errorText: { fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 18 },
  primaryButton: { width: '100%', height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 4, paddingHorizontal: 20 },
  primaryText: { ...guardiamV2Typography.bodySemibold, fontFamily: 'Manrope_600SemiBold', fontSize: 16, lineHeight: 22 },
  secondaryButton: { width: '100%', height: 54, alignItems: 'center', justifyContent: 'center', marginTop: guardiamV2Spacing.sm, borderWidth: 1 },
  secondaryText: { ...guardiamV2Typography.bodySemibold, fontFamily: 'Manrope_600SemiBold' },
  footer: { alignItems: 'center', justifyContent: 'center', paddingTop: guardiamV2Spacing.xl, paddingBottom: guardiamV2Spacing.sm },
  footerText: { fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
});
