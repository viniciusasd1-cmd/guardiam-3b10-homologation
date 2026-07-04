import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];
type QuickActionAccent = 'blue' | 'green' | 'red';

type QuickActionCardProps = {
  accent?: QuickActionAccent;
  helper: string;
  icon: IconName;
  onPress: () => void;
  title: string;
  value: string;
};

export default function HomeScreen() {
  const router = useRouter();

  function handleOpenNotifications() {
    Alert.alert(
      'Notificações',
      'Notificações reais entrarão em uma fase própria do GUARDIAM.',
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Ionicons color="#7DD3FC" name="shield-checkmark-outline" size={20} />
              </View>

              <Text style={styles.brand}>GUARDIAM</Text>
            </View>

            <Text style={styles.greeting}>Olá, usuário</Text>
          </View>

          <Pressable
            accessibilityHint="Abre informações sobre notificações."
            accessibilityLabel="Notificações"
            accessibilityRole="button"
            onPress={handleOpenNotifications}
            style={({ pressed }) => [
              styles.notificationButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#E7F3FF" name="notifications-outline" size={20} />
          </Pressable>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIcon}>
              <Ionicons color="#86EFAC" name="shield-outline" size={30} />
            </View>

            <View style={styles.statusTextBox}>
              <Text style={styles.statusEyebrow}>Modo Proteção</Text>
              <Text style={styles.statusTitle}>GUARDIAM desativado</Text>
              <Text style={styles.statusDescription}>
                Sua proteção ainda não está ativa.
              </Text>
            </View>
          </View>

          <View style={styles.statusFooter}>
            <View style={styles.statusDot} />
            <Text style={styles.statusFooterText}>
              Ative para deixar localização e alerta prontos para uso.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityHint="Abre a ativação do Modo Proteção."
          accessibilityLabel="Ativar Modo Proteção"
          accessibilityRole="button"
          onPress={() => router.push('/(app)/create-trip')}
          style={({ pressed }) => [
            styles.primaryAction,
            pressed ? styles.primaryActionPressed : null,
          ]}
        >
          <View style={styles.primaryActionIcon}>
            <Ionicons color="#04111F" name="power-outline" size={26} />
          </View>

          <View style={styles.primaryActionTextBox}>
            <Text style={styles.primaryActionTitle}>Ativar Modo Proteção</Text>
            <Text style={styles.primaryActionSubtitle}>
              Configure uma vez. Use quando precisar.
            </Text>
          </View>

          <Ionicons color="#E0F2FE" name="chevron-forward" size={22} />
        </Pressable>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Status rápido</Text>

          <View style={styles.quickGrid}>
            <QuickActionCard
              accent="blue"
              helper="Segurança"
              icon="people-outline"
              onPress={() => router.push('/(app)/trusted-contacts')}
              title="Contatos"
              value="2 prontos"
            />

            <QuickActionCard
              accent="green"
              helper="Alerta"
              icon="location-outline"
              onPress={() => router.push('/(app)/active-trip')}
              title="Localização"
              value="Pronta"
            />

            <QuickActionCard
              accent="red"
              helper="Status"
              icon="alert-circle-outline"
              onPress={() => router.push('/(app)/active-trip')}
              title="Alertas"
              value="Histórico"
            />
          </View>
        </View>

        <Pressable
          accessibilityHint="Abre a tela técnica atual do Modo Proteção."
          accessibilityLabel="Ver Modo Proteção"
          accessibilityRole="button"
          onPress={() => router.push('/(app)/active-trip')}
          style={({ pressed }) => [styles.secondaryAction, pressed ? styles.pressed : null]}
        >
          <View style={styles.secondaryIcon}>
            <Ionicons color="#7DD3FC" name="radio-outline" size={18} />
          </View>

          <View style={styles.secondaryTextBox}>
            <Text style={styles.secondaryTitle}>Ver Modo Proteção</Text>
            <Text style={styles.secondaryDescription}>
              Acompanhe status, localização e alerta.
            </Text>
          </View>

          <Ionicons color="#94A3B8" name="chevron-forward" size={18} />
        </Pressable>

        <View style={styles.footerNote}>
          <Ionicons color="#38BDF8" name="lock-closed-outline" size={16} />
          <Text style={styles.footerText}>
            GUARDIAM protege de forma simples, discreta e sempre pronta.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function QuickActionCard({
  accent = 'blue',
  helper,
  icon,
  onPress,
  title,
  value,
}: QuickActionCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${title}: ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed ? styles.pressed : null]}
    >
      <View style={[styles.quickActionIcon, getQuickActionIconStyle(accent)]}>
        <Ionicons color={getQuickActionIconColor(accent)} name={icon} size={18} />
      </View>

      <Text numberOfLines={1} style={styles.quickActionTitle}>
        {title}
      </Text>

      <Text numberOfLines={1} style={styles.quickActionValue}>
        {value}
      </Text>

      <Text numberOfLines={1} style={styles.quickActionHelper}>
        {helper}
      </Text>
    </Pressable>
  );
}

function getQuickActionIconColor(accent: QuickActionAccent) {
  if (accent === 'green') {
    return '#86EFAC';
  }

  if (accent === 'red') {
    return '#FDA4AF';
  }

  return '#7DD3FC';
}

function getQuickActionIconStyle(accent: QuickActionAccent) {
  if (accent === 'green') {
    return styles.quickActionIconGreen;
  }

  if (accent === 'red') {
    return styles.quickActionIconRed;
  }

  return styles.quickActionIconBlue;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#04111F',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.14)',
    borderColor: 'rgba(125, 211, 252, 0.34)',
    borderRadius: 14,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brand: {
    color: '#E7F3FF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  greeting: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  statusCard: {
    backgroundColor: 'rgba(8, 28, 48, 0.94)',
    borderColor: 'rgba(56, 189, 248, 0.22)',
    borderRadius: 26,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
    shadowColor: '#0EA5E9',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  statusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(134, 239, 172, 0.26)',
    borderRadius: 22,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  statusTextBox: {
    flex: 1,
  },
  statusEyebrow: {
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: '#F8FAFC',
    fontSize: 21,
    fontWeight: '800',
  },
  statusDescription: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  statusFooter: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusDot: {
    backgroundColor: '#FBBF24',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  statusFooterText: {
    color: '#CBD5E1',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    paddingHorizontal: 18,
    paddingVertical: 17,
    shadowColor: '#38BDF8',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
  },
  primaryActionPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  primaryActionIcon: {
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  primaryActionTextBox: {
    flex: 1,
  },
  primaryActionTitle: {
    color: '#04111F',
    fontSize: 17,
    fontWeight: '800',
  },
  primaryActionSubtitle: {
    color: '#0F3556',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  infoSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    backgroundColor: 'rgba(15, 23, 42, 0.84)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 124,
    padding: 12,
  },
  quickActionIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 34,
    justifyContent: 'center',
    marginBottom: 10,
    width: 34,
  },
  quickActionIconBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  quickActionIconGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  quickActionIconRed: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  quickActionTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  quickActionValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  quickActionHelper: {
    color: '#94A3B8',
    fontSize: 11,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 28, 48, 0.74)',
    borderColor: 'rgba(56, 189, 248, 0.18)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  secondaryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 15,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  secondaryTextBox: {
    flex: 1,
  },
  secondaryTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  footerNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 'auto',
    paddingHorizontal: 8,
  },
  footerText: {
    color: '#94A3B8',
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});