import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Clock,
  Lock,
  MapPin,
  Power,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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
import {
  completeTrip,
  getActiveTrip,
  getSafeTrip,
  startTrip,
  triggerPanicAlert,
} from '../../src/api/safeTripsApi';
import { useAuth } from '../../src/auth/AuthContext';
import { useTripLocationTracking } from '../../src/location/useTripLocationTracking';
import {
  clearActiveTripSession,
  saveActiveTripSession,
} from '../../src/location/activeTripSessionStorage';
import {
  createOrLoadSos,
  loadPendingSos,
  markSosConfirmed,
  markSosPending,
  markSosSending,
} from '../../src/sos/sosQueue';
import type { SafeTrip, TripStatus } from '../../src/types/safeTrip';
import { createEventId } from '../../src/utils/uuid';
import { FloatingGuardian } from '../../src/components/trip/FloatingGuardian';
import { ApprovedMapRadar } from '../../src/components/layout/ApprovedMapRadar';
import { ApprovedCard } from '../../src/components/ui';
import { GuardianController } from '../../src/guardian/GuardianController';
import { useGuardiamTheme } from '../../src/theme/GuardiamThemeProvider';
import {
  guardiamV2Radius,
  guardiamV2Spacing,
  guardiamV2Typography,
} from '../../src/theme/guardiamV2';

type Action = 'alert' | 'complete' | 'start';
type Feedback = { message: string; error: boolean };

export default function ActiveTripScreen() {
  const { safeTripId } = useLocalSearchParams<{ safeTripId?: string }>();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { theme, resolvedMode, setProtectionActive, setSosCritical } = useGuardiamTheme();
  const [safeTrip, setSafeTrip] = useState<SafeTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [localAlert, setLocalAlert] = useState(false);
  const [alertAt, setAlertAt] = useState<Date | null>(null);
  const [ended, setEnded] = useState(false);
  const trackingAttempt = useRef<string | null>(null);
  const sosEventId = useRef<string | null>(null);
  const active = safeTrip?.status === 'ACTIVE' || safeTrip?.status === 'ALERT_TRIGGERED';
  const finished = safeTrip ? isFinalStatus(safeTrip.status) : false;
  const alerted = safeTrip?.status === 'ALERT_TRIGGERED' || localAlert;

  const guardianController = new GuardianController({
    getProtectionStatus: () => getGuardianProtectionStatus(safeTrip?.status, ended),
    startProtection: async () => {
      await handleStart();
    },
    stopProtection: async () => {
      await handleComplete();
    },
    requestSOS: async () => {
      await handleAlert();
    },
  });

  const {
    permissionStatus,
    isTracking,
    lastLocation,
    lastSentAt,
    error: _locationError,
    sendCurrentLocation,
    startTracking,
    stopTracking,
  } = useTripLocationTracking({
    accessToken,
    safeTripId: safeTrip?.id,
    isTripActive: active,
  });

  const loadProtection = useCallback(async () => {
    if (!accessToken) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const result = safeTripId
        ? await getSafeTrip(accessToken, safeTripId)
        : await getActiveTrip(accessToken);
      setSafeTrip(result);
    } catch {
      setSafeTrip(null);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [accessToken, safeTripId]);

  useEffect(() => {
    void loadProtection();
  }, [loadProtection]);

  useEffect(() => {
    setLocalAlert(false);
    setAlertAt(null);
    trackingAttempt.current = null;
    sosEventId.current = null;
    if (safeTrip?.id) {
      void loadPendingSos(safeTrip.id).then((event) => {
        sosEventId.current = event?.eventId ?? null;
      });
    }
  }, [safeTrip?.id]);

  useEffect(() => {
    if (safeTrip?.status === 'ALERT_TRIGGERED' && !alertAt) {
      setAlertAt(new Date());
    }
  }, [alertAt, safeTrip?.status]);

  useEffect(() => {
    setProtectionActive(active && !ended);

    return () => {
      setProtectionActive(false);
    };
  }, [active, ended, setProtectionActive]);

  useEffect(() => {
    setSosCritical(alerted);

    return () => {
      setSosCritical(false);
    };
  }, [alerted, setSosCritical]);

  useEffect(() => {
    if (
      safeTrip &&
      !ended &&
      (safeTrip.status === 'ACTIVE' || safeTrip.status === 'ALERT_TRIGGERED')
    ) {
      void saveActiveTripSession({
        safeTripId: safeTrip.id,
        status: safeTrip.status,
        startedAt: new Date().toISOString(),
      });
      return;
    }

    if (ended || (safeTrip && isFinalStatus(safeTrip.status))) {
      void clearActiveTripSession();
    }
  }, [ended, safeTrip?.id, safeTrip?.status]);

  useEffect(() => {
    if (!safeTrip || !active || isTracking || trackingAttempt.current === safeTrip.id) return;
    trackingAttempt.current = safeTrip.id;
    void startTracking();
  }, [active, isTracking, safeTrip, startTracking]);

  async function handleStart() {
    if (!safeTrip || action) return;
    setAction('start');
    setFeedback(null);
    try {
      const result = await startTrip(requireToken(accessToken), safeTrip.id);
      trackingAttempt.current = null;
      setSafeTrip(result);
      setFeedback({
        message: 'Proteção ativada. Preparando sua localização.',
        error: false,
      });
    } catch (error) {
      setFeedback({ message: errorMessage(error), error: true });
    } finally {
      setAction(null);
    }
  }

  async function handleAlert() {
    if (!safeTrip || alerted || !active || action) return;
    setAction('alert');
    setFeedback(null);
    try {
      const queued = await createOrLoadSos(
        safeTrip.id,
        sosEventId.current ?? createEventId()
      );
      sosEventId.current = queued.eventId;
      const sending = await markSosSending(queued);
      if (!sending) return;
      await sendCurrentLocation();
      await triggerPanicAlert(
        requireToken(accessToken),
        safeTrip.id,
        sending.eventId
      );
      await markSosConfirmed(sending);
      setAlertAt(new Date());
      setLocalAlert(true);
      setSafeTrip((value) =>
        value ? { ...value, status: 'ALERT_TRIGGERED' } : value
      );
      sosEventId.current = null;
    } catch (error) {
      if (safeTrip) {
        const pending = await loadPendingSos(safeTrip.id);
        if (pending) await markSosPending(pending);
      }
      setFeedback({ message: errorMessage(error), error: true });
    } finally {
      setAction(null);
    }
  }

  async function handleComplete() {
    if (!safeTrip || action) return;
    setAction('complete');
    setFeedback(null);
    try {
      stopTracking();
      await completeTrip(requireToken(accessToken), safeTrip.id);
      setEnded(true);
      sosEventId.current = null;
    } catch (error) {
      setFeedback({ message: errorMessage(error), error: true });
    } finally {
      setAction(null);
    }
  }

  function confirmComplete() {
    Alert.alert('Desativar proteção', 'Deseja desativar o Modo Proteção?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desativar',
        style: 'destructive',
        onPress: () => void handleComplete(),
      },
    ]);
  }

  if (loading && !safeTrip) {
    return (
      <StatePage
        loading
        title="Preparando Modo Proteção..."
        text="Carregando status da sua proteção em tempo real."
        theme={theme}
        resolvedMode={resolvedMode}
      />
    );
  }

  if (loadError || !safeTrip) {
    return (
      <StatePage
        title="Não foi possível carregar o Modo Proteção."
        text="Verifique sua conexão ou tente recarregar as informações da sua proteção."
        theme={theme}
        resolvedMode={resolvedMode}
      >
        <PrimaryButton
          icon={<RefreshCw size={18} color={theme.background} />}
          label="Tentar novamente"
          onPress={() => void loadProtection()}
          theme={theme}
        />
        <SecondaryButton
          label="Voltar para o início"
          onPress={() => router.replace('/(app)/home')}
          theme={theme}
        />
      </StatePage>
    );
  }

  if (ended || finished) {
    return (
      <StatePage
        safe
        title="Proteção encerrada."
        text="Você pode ativar novamente sempre que iniciar uma nova viagem ou deslocamento."
        theme={theme}
        resolvedMode={resolvedMode}
      >
        <PrimaryButton
          icon={<Power size={18} color={theme.background} />}
          label="Iniciar Nova Proteção"
          onPress={() => router.replace('/(app)/create-trip')}
          theme={theme}
        />
        <SecondaryButton
          label="Voltar para o início"
          onPress={() => router.replace('/(app)/home')}
          theme={theme}
        />
      </StatePage>
    );
  }

  if (!active) {
    return (
      <Page theme={theme} resolvedMode={resolvedMode} scroll>
        <Header onBack={() => router.back()} theme={theme} />
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: guardiamV2Radius.lg,
            },
          ]}
        >
          <View
            style={[
              styles.iconBubble,
              {
                backgroundColor: theme.surface2,
                borderRadius: guardiamV2Radius.pill,
              },
            ]}
          >
            <Shield size={32} color={theme.brand} />
          </View>
          <Text style={[styles.eyebrow, { color: theme.text3 }]}>
            MODO PROTEÇÃO
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Proteção Pronta
          </Text>
          <Text style={[styles.copy, { color: theme.text2 }]}>
            Toque para ativar o monitoramento contínuo e a transmissão segura de localização.
          </Text>
        </View>

        {feedback ? <FeedbackBanner value={feedback} theme={theme} /> : null}

        <PrimaryButton
          disabled={action === 'start'}
          icon={
            action === 'start' ? (
              <ActivityIndicator size="small" color={theme.background} />
            ) : (
              <Power size={20} color={theme.background} />
            )
          }
          label={
            action === 'start' ? 'Ativando proteção...' : 'Ativar Proteção'
          }
          onPress={() => void handleStart()}
          theme={theme}
        />
      </Page>
    );
  }

  return (
    <Page theme={theme} resolvedMode={resolvedMode} scroll compact>
      <Header onBack={() => router.back()} theme={theme} />

      <ApprovedMapRadar isDark={resolvedMode !== 'light'} height={148} />

      <ApprovedCard variant={resolvedMode === 'dark' ? 'dark' : 'default'} style={styles.statusCard}>
      <FloatingGuardian
        disabled={action !== null}
        confirmed={alerted}
        onTrigger={() => void guardianController.requestSOS()}
      />

      {/* Main Status Hero Card */}
      {alerted ? (
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderStrong,
              borderRadius: guardiamV2Radius.lg,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: theme.surface2,
                  borderRadius: guardiamV2Radius.md,
                },
              ]}
            >
              <ShieldAlert size={28} color={theme.text} />
            </View>
            <View style={styles.cardHeaderText}>
              <View style={styles.alertBadgeRow}>
                <View style={[styles.pulseDot, { backgroundColor: '#FFFFFF' }]} />
                <Text style={[styles.alertBadgeText, { color: '#FFFFFF' }]}>
                  EMERGÊNCIA ACIONADA
                </Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Sinal SOS Emitido
              </Text>
            </View>
          </View>

          <Text style={[styles.alertDescription, { color: theme.text2 }]}>
            Seus contatos de segurança e guardiões foram notificados com prioridade máxima e estão recebendo sua localização.
          </Text>

          <View
            style={[
              styles.alertMetaBox,
              {
                backgroundColor: theme.surface2,
                borderRadius: guardiamV2Radius.md,
              },
            ]}
          >
            <View style={styles.metaRow}>
              <Clock size={15} color={theme.text2} />
              <Text style={[styles.metaText, { color: theme.text2 }]}>
                Horário do acionamento: {formatTime(alertAt)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={15} color={theme.text2} />
              <Text style={[styles.metaText, { color: theme.text2 }]}>
                {lastLocation
                  ? `GPS: ${formatLocation(lastLocation)}`
                  : 'Aguardando atualização de GPS'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
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
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: theme.surface2,
                  borderRadius: guardiamV2Radius.md,
                },
              ]}
            >
              <ShieldCheck size={28} color={theme.active} />
            </View>
            <View style={styles.cardHeaderText}>
              <View style={styles.activeBadgeRow}>
                <View style={[styles.activeDot, { backgroundColor: theme.active }]} />
                <Text style={[styles.activeBadgeText, { color: theme.active }]}>
                  GUARDIAM ATIVO
                </Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Modo Proteção em Tempo Real
              </Text>
            </View>
          </View>

          <Text style={[styles.cardDescription, { color: theme.text2 }]}>
            Sua viagem está segura. A localização está sendo monitorada e compartilhada com seus contatos.
          </Text>

          <View
            style={[
              styles.liveIndicatorBox,
              {
                backgroundColor: theme.surface2,
                borderRadius: guardiamV2Radius.md,
              },
            ]}
          >
            <Radio size={16} color={theme.active} />
            <Text style={[styles.liveIndicatorText, { color: theme.text2 }]}>
              {isTracking
                ? 'Sinal de localização ativo e transmitindo'
                : 'Preparando transmissão de GPS'}
            </Text>
          </View>
        </View>
      )}

      {feedback ? <FeedbackBanner value={feedback} theme={theme} /> : null}

      {/* SOS Button Area */}
      {!alerted ? (
        <View style={styles.sosSection}>
          <Pressable
            accessibilityHint="Mantenha pressionado por 3 segundos para acionar ajuda imediata."
            accessibilityLabel="SOS Emergência"
            accessibilityRole="button"
            delayLongPress={3000}
            disabled={action === 'alert'}
            onLongPress={() => void handleAlert()}
            style={({ pressed }) => [
              styles.sosOuterRing,
              {
                backgroundColor: theme.sosSoft,
              },
              pressed && styles.sosRingPressed,
            ]}
          >
            <View
              style={[
                styles.sosCenterButton,
                {
                  backgroundColor: theme.sos,
                },
              ]}
            >
              {action === 'alert' ? (
                <ActivityIndicator color="#FFFFFF" size="large" />
              ) : (
                <>
                  <AlertTriangle size={32} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.sosButtonText}>SOS</Text>
                </>
              )}
            </View>
          </Pressable>
          <Text style={[styles.sosHoldHint, { color: theme.text3 }]}>
            Mantenha pressionado por 3 segundos para acionar SOS
          </Text>
        </View>
      ) : null}

      {/* Telemetry / Live Metrics Strip */}
      <View style={styles.metricsGrid}>
        <MetricCard
          icon={<MapPin size={18} color={theme.brand} />}
          label="Sinal GPS"
          value={trackingLabel(isTracking, permissionStatus)}
          theme={theme}
        />
        <MetricCard
          icon={<Clock size={18} color={theme.brand} />}
          label="Último Envio"
          value={formatTime(lastSentAt)}
          theme={theme}
        />
        <MetricCard
          icon={<Activity size={18} color={theme.brand} />}
          label="Coordenadas"
          value={formatLocation(lastLocation)}
          theme={theme}
        />
      </View>

      </ApprovedCard>

      {/* Complete Trip / Deactivate Action */}
      <Pressable
        accessibilityLabel="Desativar proteção"
        accessibilityRole="button"
        disabled={action === 'complete'}
        onPress={confirmComplete}
        style={({ pressed }) => [
          styles.completeButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderStrong,
            borderRadius: guardiamV2Radius.md,
          },
          pressed && styles.buttonPressed,
          action === 'complete' && styles.buttonDisabled,
        ]}
      >
        {action === 'complete' ? (
          <ActivityIndicator size="small" color={theme.text} />
        ) : (
          <>
            <ShieldCheck size={20} color={theme.text} />
            <Text style={[styles.completeButtonText, { color: theme.text }]}>
              Encerrar Modo Proteção
            </Text>
          </>
        )}
      </Pressable>

      <View style={styles.footerNote}>
        <Lock size={14} color={theme.text3} />
        <Text style={[styles.footerText, { color: theme.text3 }]}>
          Protegido de ponta a ponta · Discreto e confiável
        </Text>
      </View>
    </Page>
  );
}

function Page({
  children,
  compact = false,
  resolvedMode,
  scroll = false,
  theme,
}: {
  children: ReactNode;
  compact?: boolean;
  resolvedMode: string;
  scroll?: boolean;
  theme: any;
}) {
  const content = (
    <View
      style={[
        styles.pageContent,
        compact && styles.pageContentCompact,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar style={resolvedMode === 'light' ? 'dark' : 'light'} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

function StatePage({
  children,
  loading = false,
  resolvedMode,
  safe = false,
  text,
  theme,
  title,
}: {
  children?: ReactNode;
  loading?: boolean;
  resolvedMode: string;
  safe?: boolean;
  text?: string;
  theme: any;
  title: string;
}) {
  return (
    <Page resolvedMode={resolvedMode} theme={theme}>
      <View style={styles.centerContent}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.brand} />
        ) : (
          <View
            style={[
              styles.stateIconBubble,
              {
                backgroundColor: safe ? theme.activeSoft : theme.sosSoft,
                borderRadius: guardiamV2Radius.pill,
              },
            ]}
          >
            {safe ? (
              <CheckCircle size={36} color={theme.active} />
            ) : (
              <AlertTriangle size={36} color={theme.sos} />
            )}
          </View>
        )}
        <Text style={[styles.stateTitle, { color: theme.text }]}>{title}</Text>
        {text ? (
          <Text style={[styles.stateText, { color: theme.text2 }]}>{text}</Text>
        ) : null}
        {children ? <View style={styles.stateActions}>{children}</View> : null}
      </View>
    </Page>
  );
}

function Header({ onBack, theme }: { onBack: () => void; theme: any }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: guardiamV2Radius.pill,
          },
          pressed && styles.buttonPressed,
        ]}
      >
        <ChevronLeft size={20} color={theme.text} />
      </Pressable>

      <View style={styles.brandRow}>
        <View
          style={[
            styles.brandLogo,
            {
              backgroundColor: theme.brand,
              borderRadius: guardiamV2Radius.md,
            },
          ]}
        >
          <Shield size={20} color={theme.background} strokeWidth={2.2} />
        </View>
        <Text style={[styles.brandText, { color: theme.text }]}>GUARDIAM</Text>
      </View>

      <View style={styles.headerSpacer} />
    </View>
  );
}

function MetricCard({
  icon,
  label,
  theme,
  value,
}: {
  icon: ReactNode;
  label: string;
  theme: any;
  value: string;
}) {
  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: guardiamV2Radius.md,
        },
      ]}
    >
      <View style={styles.metricIconBox}>{icon}</View>
      <Text style={[styles.metricLabel, { color: theme.text3 }]}>{label}</Text>
      <Text
        numberOfLines={2}
        style={[styles.metricValue, { color: theme.text }]}
      >
        {value}
      </Text>
    </View>
  );
}

function PrimaryButton({
  disabled = false,
  icon,
  label,
  onPress,
  theme,
}: {
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: theme.brand,
          borderRadius: guardiamV2Radius.md,
        },
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon}
      <Text style={[styles.primaryButtonText, { color: theme.background }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SecondaryButton({
  disabled = false,
  label,
  onPress,
  theme,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          borderColor: theme.borderStrong,
          borderRadius: guardiamV2Radius.md,
        },
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function FeedbackBanner({
  theme,
  value,
}: {
  theme: any;
  value: Feedback;
}) {
  return (
    <View
      style={[
        styles.feedbackBanner,
        {
          backgroundColor: value.error ? theme.sosSoft : theme.activeSoft,
          borderColor: value.error ? theme.sos : theme.active,
          borderRadius: guardiamV2Radius.md,
        },
      ]}
    >
      {value.error ? (
        <AlertCircle size={18} color={theme.sos} />
      ) : (
        <CheckCircle size={18} color={theme.active} />
      )}
      <Text
        style={[
          styles.feedbackText,
          { color: value.error ? theme.sos : theme.active },
        ]}
      >
        {value.message}
      </Text>
    </View>
  );
}

function formatLocation(value: { lat: number; lng: number } | null) {
  return value
    ? `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`
    : 'Aguardando GPS';
}

function formatTime(value: Date | null) {
  if (!value) return '--:--';
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

function trackingLabel(active: boolean, permission: string | null) {
  return active
    ? 'Ativo'
    : permission === 'denied'
      ? 'Permissão necessária'
      : 'Preparando';
}

function requireToken(token: string | null) {
  if (!token) throw new Error('Sessão expirada. Faça login novamente.');
  return token;
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Tente novamente em instantes.';
}

function isFinalStatus(status: TripStatus) {
  return ['ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status);
}

function getGuardianProtectionStatus(
  status: TripStatus | undefined,
  ended: boolean
) {
  if (ended || (status && isFinalStatus(status))) return 'ENDED' as const;
  if (status === 'ALERT_TRIGGERED') return 'ALERTED' as const;
  if (status === 'ACTIVE') return 'ACTIVE' as const;
  return 'INACTIVE' as const;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: guardiamV2Spacing.xl,
  },
  pageContent: {
    flexGrow: 1,
    gap: guardiamV2Spacing.md,
    paddingHorizontal: guardiamV2Spacing.lg,
    paddingTop: guardiamV2Spacing.sm,
  },
  pageContentCompact: {
    gap: guardiamV2Spacing.md,
    paddingHorizontal: guardiamV2Spacing.md,
    paddingTop: guardiamV2Spacing.xs,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    gap: guardiamV2Spacing.md,
    justifyContent: 'center',
    padding: guardiamV2Spacing.xl,
  },
  stateIconBubble: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    marginBottom: guardiamV2Spacing.sm,
    width: 72,
  },
  stateTitle: {
    ...guardiamV2Typography.title,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
    ...guardiamV2Typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  stateActions: {
    alignSelf: 'stretch',
    gap: guardiamV2Spacing.sm,
    marginTop: guardiamV2Spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    marginBottom: guardiamV2Spacing.xs,
  },
  backButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerSpacer: {
    width: 40,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  brandLogo: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  brandText: {
    ...guardiamV2Typography.title,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroCard: {
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: guardiamV2Spacing.sm,
    padding: guardiamV2Spacing.xl,
  },
  iconBubble: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  eyebrow: {
    ...guardiamV2Typography.label,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: guardiamV2Spacing.sm,
  },
  title: {
    ...guardiamV2Typography.title,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  copy: {
    ...guardiamV2Typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  statusCard: {
    borderWidth: 1,
    gap: guardiamV2Spacing.sm,
    padding: guardiamV2Spacing.lg,
  },
  cardHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    ...guardiamV2Typography.title,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  cardDescription: {
    ...guardiamV2Typography.body,
    fontSize: 13,
    lineHeight: 19,
  },
  activeBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  activeDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  activeBadgeText: {
    ...guardiamV2Typography.label,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  alertBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pulseDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  alertBadgeText: {
    ...guardiamV2Typography.label,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  alertDescription: {
    ...guardiamV2Typography.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  alertMetaBox: {
    gap: 6,
    marginTop: 4,
    padding: guardiamV2Spacing.md,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  metaText: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 12,
  },
  liveIndicatorBox: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: guardiamV2Spacing.md,
    paddingVertical: 10,
  },
  liveIndicatorText: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 12,
  },
  sosSection: {
    alignItems: 'center',
    marginVertical: guardiamV2Spacing.sm,
  },
  sosOuterRing: {
    alignItems: 'center',
    borderRadius: 80,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  sosRingPressed: {
    transform: [{ scale: 0.96 }],
  },
  sosCenterButton: {
    alignItems: 'center',
    borderRadius: 60,
    height: 116,
    justifyContent: 'center',
    width: 116,
    gap: 2,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sosHoldHint: {
    ...guardiamV2Typography.label,
    fontSize: 11,
    marginTop: guardiamV2Spacing.sm,
    textAlign: 'center',
    textTransform: 'none',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: guardiamV2Spacing.sm,
  },
  metricCard: {
    borderWidth: 1,
    flex: 1,
    minHeight: 88,
    padding: guardiamV2Spacing.sm + 2,
  },
  metricIconBox: {
    marginBottom: 4,
  },
  metricLabel: {
    ...guardiamV2Typography.label,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  metricValue: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  primaryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    height: 54,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: 2,
    width: '100%',
  },
  completeButtonText: {
    ...guardiamV2Typography.bodySemibold,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  feedbackBanner: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: guardiamV2Spacing.md,
    paddingVertical: 12,
  },
  feedbackText: {
    ...guardiamV2Typography.bodySemibold,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footerNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 4,
    paddingBottom: guardiamV2Spacing.xs,
  },
  footerText: {
    ...guardiamV2Typography.body,
    fontSize: 12,
    textAlign: 'center',
  },
});