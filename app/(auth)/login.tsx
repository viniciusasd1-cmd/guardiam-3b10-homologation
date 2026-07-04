import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthContext';
import { AppButton } from '../../src/components/AppButton';
import { AppInput } from '../../src/components/AppInput';
import { Screen } from '../../src/components/Screen';
import { colors } from '../../src/constants/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.replace('/(app)/home');
    } catch (error) {
      Alert.alert('NÃ£o foi possÃ­vel entrar', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>GUARDIAM</Text>
        <Text style={styles.title}>ProteÃ§Ã£o discreta para cada deslocamento.</Text>
        <Text style={styles.subtitle}>
          Entre para acompanhar proteção pessoal, contatos de confianÃ§a e alertas de segurança.
        </Text>
      </View>

      <View style={styles.form}>
        <AppInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail"
          onChangeText={setEmail}
          value={email}
        />
        <AppInput
          label="Senha"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />
        <AppButton loading={loading} onPress={handleLogin} title="Entrar" />
      </View>

      <Text style={styles.footer}>
        Ainda nÃ£o tem conta?{' '}
        <Link href="/(auth)/register" style={styles.link}>
          Criar cadastro
        </Link>
      </Text>
    </Screen>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente em instantes.';
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
    paddingTop: 28,
  },
  brand: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 14,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: '800',
  },
});

