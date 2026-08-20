import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthContext';
import { AppButton } from '../../src/components/AppButton';
import { AppInput } from '../../src/components/AppInput';
import { Screen } from '../../src/components/Screen';
import { colors } from '../../src/constants/colors';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(app)/home');
    } catch (error) {
      Alert.alert('Não foi possível criar a conta', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Seu cofre de segurança para viagens começa com um cadastro simples.
        </Text>
      </View>

      <View style={styles.form}>
        <AppInput label="Nome" onChangeText={setName} value={name} />
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
        <AppButton loading={loading} onPress={handleRegister} title="Criar conta" />
      </View>
    </Screen>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente em instantes.';
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    paddingTop: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  form: {
    gap: 14,
  },
});