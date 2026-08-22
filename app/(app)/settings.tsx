import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell, Lock, Moon, ShieldCheck, Sun, User } from 'lucide-react-native';
import { ApprovedCard, ApprovedSettingItem } from '../../src/components/ui';
import { ApprovedHeader } from '../../src/components/layout';
import { useAuth } from '../../src/auth/AuthContext';
import { useGuardiamTheme } from '../../src/theme/GuardiamThemeProvider';
import { guardiamV2Spacing, guardiamV2Typography } from '../../src/theme/guardiamV2';

export default function SettingsScreen() {
  const { theme, resolvedMode, userPreference, setUserPreference } = useGuardiamTheme();
  const { logout } = useAuth();
  const isDark = resolvedMode === 'dark' || resolvedMode === 'darkNavy';

  function handleLogout() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void logout().then(() => router.replace('/(auth)/login'));
        },
      },
    ]);
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ApprovedHeader title="Configurações" showBack onBack={() => router.back()} variant={isDark ? 'dark' : 'light'} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: theme.text3 }]}>Aparência</Text>
        <ApprovedCard style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ApprovedSettingItem
            icon={userPreference === 'dark' ? <Moon color={theme.text2} size={18} /> : <Sun color={theme.text2} size={18} />}
            label="Modo escuro"
            badge={userPreference === 'dark' ? 'Ativo' : undefined}
            onPress={() => setUserPreference(userPreference === 'dark' ? 'light' : 'dark')}
            isDark={isDark}
          />
        </ApprovedCard>

        <Text style={[styles.sectionLabel, { color: theme.text3 }]}>Segurança</Text>
        <ApprovedCard style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ApprovedSettingItem icon={<ShieldCheck color={theme.text2} size={18} />} label="Proteção e permissões" isDark={isDark} />
          <ApprovedSettingItem icon={<Lock color={theme.text2} size={18} />} label="Privacidade" isDark={isDark} />
          <ApprovedSettingItem icon={<Bell color={theme.text2} size={18} />} label="Notificações" isDark={isDark} />
        </ApprovedCard>

        <Text style={[styles.sectionLabel, { color: theme.text3 }]}>Conta</Text>
        <ApprovedCard style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ApprovedSettingItem icon={<User color={theme.text2} size={18} />} label="Perfil" isDark={isDark} />
          <ApprovedSettingItem icon={<ShieldCheck color={theme.sos} size={18} />} label="Sair da conta" onPress={handleLogout} isDark={isDark} />
        </ApprovedCard>

        <Text style={[styles.note, { color: theme.text3 }]}>Algumas opções visuais ainda não possuem fluxo funcional no GUARDIAM.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: guardiamV2Spacing.lg, paddingBottom: guardiamV2Spacing.xl },
  sectionLabel: { ...guardiamV2Typography.label, marginBottom: guardiamV2Spacing.sm },
  card: { marginBottom: guardiamV2Spacing.lg, padding: guardiamV2Spacing.sm },
  note: { ...guardiamV2Typography.body, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
