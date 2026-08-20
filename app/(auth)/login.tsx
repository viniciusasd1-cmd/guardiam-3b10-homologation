import { Eye, EyeOff, Lock, Mail, Moon, Shield, Sun } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/auth/AuthContext';

const palette = { background: '#F4F7FC', surface: '#FFFFFF', surface2: '#F8FAFC', field: '#F4F7FC', text: '#0F172A', text2: '#475569', text3: '#94A3B8', border: '#E2E8F0', borderStrong: '#CBD5E1', error: '#B42318', errorSurface: '#FFF4F2' };

export default function LoginScreen() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const isDark = themeMode === 'dark';
  const theme = isDark ? { background: '#0A1220', surface: '#101B2E', field: '#16233B', text: '#F5F8FF', text2: '#A9B7CE', text3: '#6B7C97', border: '#24344F', borderStrong: '#33486B' } : { background: '#F4F7FC', surface: '#FFFFFF', field: '#F4F7FC', text: '#0F172A', text2: '#475569', text3: '#94A3B8', border: '#E2E8F0', borderStrong: '#CBD5E1' };
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    if (loading) return;
    setLoading(true); setErrorMessage(null);
    try { await login(email.trim(), password); router.replace('/(app)/home'); }
    catch (error) { const message = getErrorMessage(error); setErrorMessage(message); Alert.alert('Não foi possível entrar', message); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { backgroundColor: theme.surface }]}><Pressable accessibilityLabel={isDark ? "Ativar modo claro" : "Ativar modo escuro"} accessibilityRole="button" onPress={() => setThemeMode(isDark ? "light" : "dark")} style={[styles.themeToggle, { backgroundColor: theme.background, borderColor: theme.border }]}>{isDark ? <Sun size={20} color={theme.text2} /> : <Moon size={20} color={theme.text2} />}</Pressable>
            <View style={styles.hero} accessibilityRole="header"><View style={[styles.shield, { backgroundColor: theme.text }]}><Shield size={32} color={theme.surface} strokeWidth={2.2} /></View><Text style={[styles.brand, { color: theme.text }]}>GUARDIAM</Text><Text style={[styles.tagline, { color: theme.text2 }]}>Sua segurança começa aqui.</Text></View>
            <View style={styles.form}>
              <View><Text style={[styles.label, { color: theme.text2 }]}>E-mail</Text><View style={[styles.inputField, { backgroundColor: theme.field, borderColor: theme.border }, focusedField === 'email' && { borderColor: theme.text, borderWidth: 2 }, errorMessage && styles.inputError]}><Mail size={19} color={theme.text3} strokeWidth={2} /><TextInput accessibilityLabel="E-mail" autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="seu@email.com" placeholderTextColor={theme.text3} returnKeyType="next" value={email} onBlur={() => setFocusedField(null)} onChangeText={(value) => { setEmail(value); setErrorMessage(null); }} onFocus={() => setFocusedField('email')} style={[styles.input, { color: theme.text, backgroundColor: theme.field }]} /></View></View>
              <View style={styles.passwordGroup}><Text style={[styles.label, { color: theme.text2 }]}>Senha</Text><View style={[styles.inputField, { backgroundColor: theme.field, borderColor: theme.border }, focusedField === 'password' && { borderColor: theme.text, borderWidth: 2 }, errorMessage && styles.inputError]}><Lock size={19} color={theme.text3} strokeWidth={2} /><TextInput accessibilityLabel="Senha" autoCapitalize="none" autoComplete="password" placeholder="••••••••" placeholderTextColor={theme.text3} returnKeyType="done" secureTextEntry={!showPassword} value={password} onBlur={() => setFocusedField(null)} onChangeText={(value) => { setPassword(value); setErrorMessage(null); }} onFocus={() => setFocusedField('password')} onSubmitEditing={() => void handleLogin()} style={[styles.passwordInput, { color: theme.text, backgroundColor: theme.field }]} /><Pressable accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} accessibilityRole="button" accessibilityState={{ expanded: showPassword }} hitSlop={10} onPress={() => setShowPassword((visible) => !visible)} style={styles.eyeButton}>{showPassword ? <EyeOff size={18} color={theme.text3} /> : <Eye size={18} color={theme.text3} />}</Pressable></View></View>
              {errorMessage ? <View accessibilityLiveRegion="polite" style={styles.errorBox}><Text style={styles.errorText}>{errorMessage}</Text></View> : null}
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading, busy: loading }} disabled={loading} onPress={() => void handleLogin()} style={({ pressed }) => [styles.primaryButton, pressed && !loading && styles.pressed, loading && styles.disabled]}>{loading ? <ActivityIndicator size="small" color={palette.surface} /> : <Text style={[styles.primaryText, { color: theme.surface }]}>Entrar</Text>}</Pressable>
              <Pressable accessibilityLabel="Criar cadastro" accessibilityRole="button" accessibilityState={{ disabled: loading }} disabled={loading} onPress={() => router.push('/(auth)/register')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, loading && styles.disabled]}><Text style={[styles.secondaryText, { color: theme.text }]}>Criar cadastro</Text></Pressable>
            </View>
            <View style={styles.footer}><Text style={[styles.footerText, { color: theme.text3 }]}>Protegido de ponta a ponta · Discreto e confiável</Text></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown) { return error instanceof Error ? error.message : 'Tente novamente em instantes.'; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  themeToggle: { position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, zIndex: 2 }, keyboard: { flex: 1 }, scrollContent: { flexGrow: 1 }, content: { flexGrow: 1, minHeight: '100%', backgroundColor: palette.surface, paddingHorizontal: 32, justifyContent: 'center', paddingVertical: 24 }, hero: { alignItems: 'center', marginBottom: 48 }, shield: { width: 64, height: 64, borderRadius: 16, backgroundColor: palette.text, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }, brand: { color: palette.text, fontFamily: 'Manrope_800ExtraBold', fontSize: 24, marginBottom: 8 }, tagline: { color: palette.text2, fontFamily: 'Manrope_400Regular', fontSize: 15 }, form: { gap: 16 }, label: { color: palette.text2, fontFamily: 'Manrope_600SemiBold', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }, inputField: { height: 56, width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 16, backgroundColor: palette.field, borderWidth: 1, borderColor: palette.border }, passwordGroup: { marginTop: 16 }, input: { flex: 1, height: 56, marginLeft: 12, paddingVertical: 0, paddingHorizontal: 0, color: palette.text, fontFamily: 'Manrope_400Regular', fontSize: 15 }, passwordInput: { flex: 1, height: 56, marginLeft: 12, paddingVertical: 0, paddingHorizontal: 0, color: palette.text, fontFamily: 'Manrope_400Regular', fontSize: 15 }, eyeButton: { width: 32, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }, inputFocused: { borderColor: palette.text, borderWidth: 2 }, inputError: { backgroundColor: palette.errorSurface, borderColor: '#D92D20' }, errorBox: { paddingHorizontal: 3, marginTop: 2 }, errorText: { color: palette.error, fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 18 }, primaryButton: { width: '100%', height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 4, paddingHorizontal: 20, borderRadius: 16, backgroundColor: palette.text }, primaryText: { color: palette.surface, fontFamily: 'Manrope_600SemiBold', fontSize: 16, lineHeight: 22 }, secondaryButton: { width: '100%', height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderRadius: 16, borderWidth: 1, borderColor: palette.borderStrong, backgroundColor: 'transparent' }, secondaryText: { color: palette.text, fontFamily: 'Manrope_600SemiBold', fontSize: 15, lineHeight: 21 }, footer: { marginTop: 'auto', alignItems: 'center', justifyContent: 'center', paddingTop: 32, paddingBottom: 24 }, footerText: { color: palette.text3, fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' }, pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] }, disabled: { opacity: 0.5 },
});

