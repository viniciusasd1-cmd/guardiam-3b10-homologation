import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Car,
  ChevronRight,
  FileText,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Moon,
  PlusCircle,
  Power,
  Radio,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  Users,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createSafeTrip, getActiveTrip, startTrip } from '../../src/api/safeTripsApi';
import { useAuth } from '../../src/auth/AuthContext';
import { useGuardiamTheme } from '../../src/theme/GuardiamThemeProvider';
import {
  guardiamV2Radius,
  guardiamV2Spacing,
  guardiamV2Typography,
} from '../../src/theme/guardiamV2';

type QuickActionCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  helper: string;
  onPress: () => void;
  accentBg?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuth();
  const { theme, resolvedMode, userPreference, setUserPreference } = useGuardiamTheme();
  const [activating, setActivating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleToggleTheme() {
    setUserPreference(userPreference === 'dark' ? 'light' : 'dark');
  }

  function handleOpenNotifications() {
    Alert.alert('Notificações', 'Nenhum alerta recente pendente no momento.');
  }

  function handleConfirmLogout() {
    Alert.alert('Sair da conta', 'Deseja realmente desconectar do GUARDIAM?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setMenuOpen(false);
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  async function handleActivateProtection() {
    if (activating) return;
    if (!accessToken) {
      Alert.alert(
        'Sessão expirada',
        'Faça login novamente para ativar o Modo Proteção.'
      );
      return;
    }
    setActivating(true);
    let createdSafeTripId: string | null = null;
    try {
      const existingSafeTrip = await getActiveTrip(accessToken);
      if (existingSafeTrip) {
        router.replace({
          pathname: '/(app)/active-trip',
          params: { safeTripId: existingSafeTrip.id },
        });
        return;
      }
      const safeTrip = await createSafeTrip(accessToken, {
        tripType: 'RIDE_APP',
      });
      createdSafeTripId = safeTrip.id;
      const startedSafeTrip = await startTrip(accessToken, safeTrip.id);
      if (startedSafeTrip.status !== 'ACTIVE') {
        throw new Error('A proteção não retornou como ativa.');
      }
      router.replace({
        pathname: '/(app)/active-trip',
        params: { safeTripId: startedSafeTrip.id },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Tente novamente em instantes.';
      if (createdSafeTripId) {
        Alert.alert('Não foi possível ativar a proteção', message, [
          { text: 'Agora não', style: 'cancel' },
          {
            text: 'Tentar novamente',
            onPress: () =>
              router.replace({
                pathname: '/(app)/active-trip',
                params: { safeTripId: createdSafeTripId as string },
              }),
          },
        ]);
      } else {
        Alert.alert('Não foi possível ativar a proteção', message);
      }
    } finally {
      setActivating(false);
    }
  }

  const displayName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View
                style={[
                  styles.logoMark,
                  {
                    backgroundColor: theme.brand,
                    borderRadius: guardiamV2Radius.md,
                  },
                ]}
              >
                <Shield size={24} color={theme.background} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={[styles.brand, { color: theme.text }]}>GUARDIAM</Text>
                <Text style={[styles.headerMeta, { color: theme.text3 }]}>
                  CENTRAL DE PROTEÇÃO
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityLabel="Alternar tema"
                accessibilityRole="button"
                onPress={handleToggleTheme}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderRadius: guardiamV2Radius.pill,
                  },
                  pressed && styles.pressed,
                ]}
              >
                {resolvedMode === 'dark' ? (
                  <Sun size={18} color={theme.text} />
                ) : (
                  <Moon size={18} color={theme.text} />
                )}
              </Pressable>

              <Pressable
                accessibilityLabel="Notificações"
                accessibilityRole="button"
                onPress={handleOpenNotifications}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderRadius: guardiamV2Radius.pill,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Bell size={18} color={theme.text} />
              </Pressable>

              <Pressable
                accessibilityLabel={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                accessibilityRole="button"
                onPress={() => setMenuOpen((open) => !open)}
                style={({ pressed }) => [
                  styles.iconButton,
                  {
                    backgroundColor: menuOpen ? theme.surface2 : theme.surface,
                    borderColor: theme.border,
                    borderRadius: guardiamV2Radius.pill,
                  },
                  pressed && styles.pressed,
                ]}
              >
                {menuOpen ? (
                  <X size={18} color={theme.text} />
                ) : (
                  <Menu size={18} color={theme.text} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Quick Menu Panel */}
          {menuOpen ? (
            <View
              style={[
                styles.menuPanel,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderRadius: guardiamV2Radius.lg,
                },
              ]}
            >
              <Text style={[styles.menuLabel, { color: theme.text3 }]}>
                ACESSO RÁPIDO
              </Text>
              <MenuItem
                icon={<Radio size={18} color={theme.brand} />}
                label="Modo Proteção"
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(app)/active-trip');
                }}
                theme={theme}
              />
              <MenuItem
                icon={<Users size={18} color={theme.brand} />}
                label="Contatos confiáveis"
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(app)/trusted-contacts');
                }}
                theme={theme}
              />
              <MenuItem
                icon={<PlusCircle size={18} color={theme.brand} />}
                label="Criar proteção"
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(app)/create-trip');
                }}
                theme={theme}
              />
              <MenuItem
                icon={<FileText size={18} color={theme.brand} />}
                label="Alertas / Histórico"
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(app)/alerts');
                }}
                theme={theme}
              />
              <MenuItem
                icon={<Settings size={18} color={theme.brand} />}
                label="Configurações"
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(app)/settings');
                }}
                theme={theme}
              />
              <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
              <MenuItem
                icon={<LogOut size={18} color={theme.sos} />}
                label="Sair da conta"
                onPress={handleConfirmLogout}
                textColor={theme.sos}
                theme={theme}
              />
            </View>
          ) : null}

          {/* Greeting Section */}
          <View style={styles.welcome}>
            <Text style={[styles.eyebrow, { color: theme.text3 }]}>
              BEM-VINDO AO GUARDIAM
            </Text>
            <Text style={[styles.greeting, { color: theme.text }]}>
              Olá, <Text style={{ fontWeight: '800' }}>{displayName}</Text>
            </Text>
            <Text style={[styles.welcomeCopy, { color: theme.text2 }]}>
              Sua segurança começa aqui. Central de proteção ativa.
            </Text>
          </View>

          {/* Status Card */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderRadius: guardiamV2Radius.lg,
              },
            ]}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor: theme.surface2,
                    borderRadius: guardiamV2Radius.md,
                  },
                ]}
              >
                <ShieldCheck size={28} color={theme.text2} />
              </View>
              <View style={styles.statusCopy}>
                <Text style={[styles.cardEyebrow, { color: theme.text3 }]}>
                  STATUS DA PROTEÇÃO
                </Text>
                <Text style={[styles.statusTitle, { color: theme.text }]}>
                  Proteção desativada
                </Text>
                <Text style={[styles.statusDescription, { color: theme.text2 }]}>
                  Você ainda não está em uma viagem monitorada.
                </Text>
              </View>
              <View
                style={[
                  styles.offPill,
                  {
                    backgroundColor: theme.warnSoft,
                    borderRadius: guardiamV2Radius.pill,
                  },
                ]}
              >
                <View style={[styles.offDot, { backgroundColor: theme.warn }]} />
                <Text style={[styles.offText, { color: theme.warn }]}>OFF</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusFooter,
                {
                  backgroundColor: theme.surface2,
                  borderRadius: guardiamV2Radius.md,
                },
              ]}
            >
              <Lock size={15} color={theme.text3} />
              <Text style={[styles.statusFooterText, { color: theme.text2 }]}>
                Ative para compartilhar sua localização e áudio em tempo real.
              </Text>
            </View>
          </View>

          {/* Primary Action Button: Ativar Proteção */}
          <Pressable
            accessibilityLabel="Ativar proteção"
            accessibilityRole="button"
            accessibilityState={{ disabled: activating }}
            disabled={activating}
            onPress={() => void handleActivateProtection()}
            style={({ pressed }) => [
              styles.primaryAction,
              {
                backgroundColor: theme.brand,
                borderRadius: guardiamV2Radius.md,
              },
              pressed && !activating && styles.pressed,
              activating && styles.disabled,
            ]}
          >
            <View
              style={[
                styles.primaryIcon,
                {
                  backgroundColor: theme.background,
                  borderRadius: guardiamV2Radius.md,
                },
              ]}
            >
              {activating ? (
                <ActivityIndicator size="small" color={theme.brand} />
              ) : (
                <Power size={20} color={theme.brand} />
              )}
            </View>
            <View style={styles.primaryCopy}>
              <Text style={[styles.primaryTitle, { color: theme.background }]}>
                {activating ? 'Ativando proteção...' : 'Ativar Proteção'}
              </Text>
              <Text style={[styles.primarySubtitle, { color: theme.background, opacity: 0.85 }]}>
                Iniciar monitoramento em tempo real
              </Text>
            </View>
            <ArrowRight size={20} color={theme.background} />
          </Pressable>

          {/* Secondary Quick Action: Emergency SOS */}
          <Pressable
            accessibilityLabel="SOS Emergência"
            accessibilityRole="button"
            onPress={() => router.push('/(app)/active-trip')}
            style={({ pressed }) => [
              styles.sosAction,
              {
                backgroundColor: theme.sosSoft,
                borderColor: theme.sos,
                borderRadius: guardiamV2Radius.md,
              },
              pressed && styles.pressed,
            ]}
          >
            <AlertTriangle size={18} color={theme.sos} strokeWidth={2.5} />
            <Text style={[styles.sosActionText, { color: theme.sos }]}>
              SOS Emergência
            </Text>
          </Pressable>

          {/* Quick Access Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recursos de Segurança
            </Text>
            <Text style={[styles.sectionHint, { color: theme.text3 }]}>
              GUARDIAM
            </Text>
          </View>

          {/* 4-Item Grid */}
          <View style={styles.quickGrid}>
            <View style={styles.quickRow}>
              <QuickActionCard
                accentBg={theme.surface2}
                helper="3 guardiões"
                icon={<Users size={20} color={theme.brand} />}
                onPress={() => router.push('/(app)/trusted-contacts')}
                title="Contatos"
                value="Confiáveis"
              />
              <QuickActionCard
                accentBg={theme.surface2}
                helper="Uber / 99"
                icon={<Car size={20} color={theme.brand} />}
                onPress={() => router.push('/(app)/create-trip')}
                title="Nova Viagem"
                value="Planejar"
              />
            </View>

            <View style={styles.quickRow}>
              <QuickActionCard
                accentBg={theme.surface2}
                helper="Sinal Ativo"
                icon={<MapPin size={20} color={theme.brand} />}
                onPress={() => router.push('/(app)/active-trip')}
                title="Localização"
                value="GPS Seguro"
              />
              <QuickActionCard
                accentBg={theme.surface2}
                helper="Evidências"
                icon={<FileText size={20} color={theme.brand} />}
                onPress={() => router.push('/(app)/alerts')}
                title="Dossiês"
                value="Histórico"
              />
            </View>
          </View>

          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Lock size={14} color={theme.text3} />
            <Text style={[styles.footerText, { color: theme.text3 }]}>
              Protegido de ponta a ponta · Discreto e confiável
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  textColor,
  theme,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  textColor?: string;
  theme: any;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { borderRadius: guardiamV2Radius.md },
        pressed && { backgroundColor: theme.surface2 },
      ]}
    >
      <View style={styles.menuItemIcon}>{icon}</View>
      <Text
        style={[
          styles.menuItemText,
          { color: textColor || theme.text },
        ]}
      >
        {label}
      </Text>
      <ChevronRight size={16} color={theme.text3} />
    </Pressable>
  );
}

function QuickActionCard({
  helper,
  icon,
  onPress,
  title,
  value,
}: QuickActionCardProps) {
  const { theme } = useGuardiamTheme();
  return (
    <Pressable
      accessibilityLabel={`${title}: ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: guardiamV2Radius.md,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.quickIcon,
          {
            backgroundColor: theme.surface2,
            borderRadius: guardiamV2Radius.md,
          },
        ]}
      >
        {icon}
      </View>
      <Text numberOfLines={1} style={[styles.quickTitle, { color: theme.text2 }]}>
        {title}
      </Text>
      <Text numberOfLines={1} style={[styles.quickValue, { color: theme.text }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={[styles.quickHelper, { color: theme.text3 }]}>
        {helper}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: guardiamV2Spacing.xl,
  },
  container: {
    gap: guardiamV2Spacing.md,
    paddingHorizontal: guardiamV2Spacing.lg,
    paddingTop: guardiamV2Spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logoMark: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  brand: {
    ...guardiamV2Typography.title,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerMeta: {
    ...guardiamV2Typography.label,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuPanel: {
    borderWidth: 1,
    gap: 4,
    padding: guardiamV2Spacing.md,
  },
  menuLabel: {
    ...guardiamV2Typography.label,
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  menuItemIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  menuItemText: {
    ...guardiamV2Typography.bodySemibold,
    flex: 1,
    fontSize: 14,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  welcome: {
    gap: 4,
    paddingTop: guardiamV2Spacing.xs,
  },
  eyebrow: {
    ...guardiamV2Typography.label,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  greeting: {
    ...guardiamV2Typography.title,
    fontSize: 26,
    fontWeight: '700',
  },
  welcomeCopy: {
    ...guardiamV2Typography.body,
    fontSize: 14,
  },
  statusCard: {
    borderWidth: 1,
    padding: guardiamV2Spacing.lg,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  statusIcon: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  statusCopy: {
    flex: 1,
  },
  cardEyebrow: {
    ...guardiamV2Typography.label,
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  statusTitle: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 16,
    fontWeight: '800',
  },
  statusDescription: {
    ...guardiamV2Typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  offPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  offDot: {
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  offText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: guardiamV2Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusFooterText: {
    ...guardiamV2Typography.body,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  primaryAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: guardiamV2Spacing.md,
    paddingVertical: 16,
  },
  primaryIcon: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  primaryCopy: {
    flex: 1,
  },
  primaryTitle: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 16,
    fontWeight: '800',
  },
  primarySubtitle: {
    ...guardiamV2Typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  sosAction: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  sosActionText: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: guardiamV2Spacing.xs,
  },
  sectionTitle: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHint: {
    ...guardiamV2Typography.label,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  quickGrid: {
    gap: guardiamV2Spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    gap: guardiamV2Spacing.sm,
  },
  quickAction: {
    borderWidth: 1,
    flex: 1,
    padding: guardiamV2Spacing.md,
  },
  quickIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginBottom: 8,
    width: 36,
  },
  quickTitle: {
    ...guardiamV2Typography.label,
    fontSize: 11,
    marginBottom: 2,
  },
  quickValue: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 14,
    marginBottom: 2,
  },
  quickHelper: {
    ...guardiamV2Typography.body,
    fontSize: 11,
  },
  footerNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: guardiamV2Spacing.sm,
  },
  footerText: {
    ...guardiamV2Typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
