import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthContext';
import { AppButton } from '../../src/components/AppButton';
import { Screen } from '../../src/components/Screen';
import { StatusPill } from '../../src/components/StatusPill';
import { colors } from '../../src/constants/colors';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.brand}>GUARDIAM</Text>
        <Text style={styles.title}>OlÃ¡, {user?.name ?? 'viajante'}.</Text>
        <StatusPill label="ProteÃ§Ã£o pronta" tone="ready" />
      </View>

      <View style={styles.grid}>
        <Pressable
          onPress={() => router.push('/(app)/create-trip')}
          style={styles.primaryCard}
        >
          <Text style={styles.cardEyebrow}>Modo Proteção</Text>
          <Text style={styles.cardTitle}>Ativar Modo Proteção</Text>
          <Text style={styles.cardText}>
            Crie uma rota protegida e habilite localizaÃ§Ã£o, alerta silencioso e evidÃªncias.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(app)/trusted-contacts')}
          style={styles.card}
        >
          <Text style={styles.cardEyebrow}>Rede de apoio</Text>
          <Text style={styles.cardTitleDark}>Contatos de confianÃ§a</Text>
          <Text style={styles.cardTextDark}>
            Gerencie quem poderá ser avisado em caso de alerta.
          </Text>
        </Pressable>
      </View>

      <AppButton
        onPress={() => router.push('/(app)/active-trip')}
        title="Ver Modo Proteção"
        variant="secondary"
      />
      <AppButton onPress={handleLogout} title="Sair" variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
    paddingTop: 22,
  },
  brand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  grid: {
    gap: 14,
  },
  primaryCard: {
    backgroundColor: colors.ink,
    borderRadius: 8,
    gap: 10,
    minHeight: 190,
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    minHeight: 150,
    padding: 20,
  },
  cardEyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
  cardTitleDark: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  cardText: {
    color: '#D5DEE8',
    fontSize: 15,
    lineHeight: 22,
  },
  cardTextDark: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});

