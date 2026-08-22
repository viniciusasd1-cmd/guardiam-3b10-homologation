import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { ApprovedCard } from '../../src/components/ui';
import { ApprovedHeader } from '../../src/components/layout';
import { useGuardiamTheme } from '../../src/theme/GuardiamThemeProvider';
import { guardiamV2Spacing, guardiamV2Typography } from '../../src/theme/guardiamV2';

export default function AlertsScreen() {
  const { theme, resolvedMode } = useGuardiamTheme();
  const isDark = resolvedMode === 'dark' || resolvedMode === 'darkNavy';

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ApprovedHeader title="Alertas" showBack onBack={() => router.back()} variant={isDark ? 'dark' : 'light'} />
      <ScrollView contentContainerStyle={styles.content}>
        <ApprovedCard style={[styles.timeline, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <Clock color={theme.text3} size={28} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhum alerta registrado</Text>
          <Text style={[styles.emptyCopy, { color: theme.text2 }]}>Os alertas reais do GUARDIAM aparecerão aqui quando houver um registro.</Text>
        </ApprovedCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: guardiamV2Spacing.lg },
  timeline: { alignItems: 'center', minHeight: 220, justifyContent: 'center', padding: guardiamV2Spacing.xl },
  emptyIcon: { alignItems: 'center', borderRadius: 32, borderWidth: 1, height: 64, justifyContent: 'center', marginBottom: guardiamV2Spacing.md, width: 64 },
  emptyTitle: { ...guardiamV2Typography.title, fontSize: 17, marginBottom: guardiamV2Spacing.sm, textAlign: 'center' },
  emptyCopy: { ...guardiamV2Typography.body, lineHeight: 21, textAlign: 'center' },
});
