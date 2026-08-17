import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { completeTrip, getActiveTrip, getSafeTrip, startTrip, triggerPanicAlert } from '../../src/api/safeTripsApi';
import { useAuth } from '../../src/auth/AuthContext';
import { useTripLocationTracking } from '../../src/location/useTripLocationTracking';
import { createOrLoadSos, loadPendingSos, markSosConfirmed, markSosPending, markSosSending } from '../../src/sos/sosQueue';
import type { SafeTrip, TripStatus } from '../../src/types/safeTrip';
import { createEventId } from '../../src/utils/uuid';
import { FloatingGuardian } from '../../src/components/trip/FloatingGuardian';
import { GuardianController } from '../../src/guardian/GuardianController';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Action = 'alert' | 'complete' | 'start';
type Feedback = { message: string; error: boolean };

export default function ActiveTripScreen() {
  const { safeTripId } = useLocalSearchParams<{ safeTripId?: string }>();
  const router = useRouter();
  const { accessToken } = useAuth();
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
    startProtection: async () => { await handleStart(); },
    stopProtection: async () => { await handleComplete(); },
    requestSOS: async () => { await handleAlert(); },
  });

  const { permissionStatus, isTracking, lastLocation, lastSentAt, error: locationError, sendCurrentLocation, startTracking, stopTracking } = useTripLocationTracking({
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

  useEffect(() => { void loadProtection(); }, [loadProtection]);
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
    if (safeTrip?.status === 'ALERT_TRIGGERED' && !alertAt) setAlertAt(new Date());
  }, [alertAt, safeTrip?.status]);
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
      setFeedback({ message: 'Proteção ativada. Preparando sua localização.', error: false });
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
      const queued = await createOrLoadSos(safeTrip.id, sosEventId.current ?? createEventId());
      sosEventId.current = queued.eventId;
      const sending = await markSosSending(queued);
      if (!sending) return;
      await sendCurrentLocation();
      // A response with `idempotent: true` is confirmation of this same SOS.
      await triggerPanicAlert(
        requireToken(accessToken),
        safeTrip.id,
        sending.eventId,
      );
      await markSosConfirmed(sending);
      setAlertAt(new Date());
      setLocalAlert(true);
      setSafeTrip((value) => value ? { ...value, status: 'ALERT_TRIGGERED' } : value);
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
      { text: 'Desativar', style: 'destructive', onPress: () => void handleComplete() },
    ]);
  }

  if (loading && !safeTrip) return <StatePage loading title="Preparando Modo Proteção..." text="Carregando status da sua proteção." />;
  if (loadError || !safeTrip) return (
    <StatePage title="Não foi possível carregar o Modo Proteção.">
      <Primary icon="refresh-outline" label="Tentar novamente" onPress={() => void loadProtection()} />
      <Secondary label="Voltar para início" onPress={() => router.replace('/(app)/home')} />
    </StatePage>
  );
  if (ended || finished) return (
    <StatePage safe title="Proteção encerrada." text="Você pode ativar novamente quando quiser.">
      <Primary icon="power-outline" label="Ativar novamente" onPress={() => router.replace('/(app)/create-trip')} />
      <Secondary label="Voltar para início" onPress={() => router.replace('/(app)/home')} />
    </StatePage>
  );
  if (!active) return (
    <Page scroll>
      <Header onBack={() => router.back()} />
      <View style={styles.hero}>
        <IconBubble icon="shield-outline" />
        <Text style={styles.eyebrow}>Modo Proteção</Text>
        <Text style={styles.title}>Proteção pronta</Text>
        <Text style={styles.copy}>Toque para ativar sua proteção.</Text>
      </View>
      {feedback ? <FeedbackBanner value={feedback} /> : null}
      <Primary disabled={action === 'start'} icon={action === 'start' ? 'hourglass-outline' : 'power-outline'} label={action === 'start' ? 'Ativando proteção...' : 'Ativar proteção'} onPress={() => void handleStart()} />
    </Page>
  );

  return (
      <Page scroll compact>
      <Header onBack={() => router.back()} />
      <FloatingGuardian disabled={action !== null} confirmed={alerted} onTrigger={() => void guardianController.requestSOS()} />
      {alerted ? (
        <View style={[styles.card, styles.alertCard]}>
          <View style={styles.row}><IconBubble alert icon="alert-circle-outline" /><View style={styles.flex}><Text style={styles.alertEyebrow}>SOS</Text><Text style={styles.cardTitle}>Alerta acionado</Text></View></View>
          <Text style={styles.alertCopy}>Seus contatos de segurança serão avisados.</Text>
          <View style={styles.between}><Text style={styles.meta}>{lastLocation ? 'Localização registrada' : 'Localização sendo preparada'}</Text><Text style={styles.meta}>{formatTime(alertAt)}</Text></View>
          <View style={styles.alertBadge}><View style={styles.redDot} /><Text style={styles.alertBadgeText}>Em andamento</Text></View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}><IconBubble icon="shield-checkmark-outline" /><View style={styles.flex}><Text style={styles.eyebrow}>Modo Proteção</Text><Text style={styles.cardTitle}>GUARDIAM ativo</Text><Text style={styles.cardCopy}>Sua proteção está ativa</Text></View></View>
          <View style={styles.status}><View style={styles.greenDot} /><Text style={styles.statusText}>{isTracking ? 'Localização pronta para envio' : 'Preparando localização'}</Text><Text style={styles.activeBadge}>Proteção ativa</Text></View>
        </View>
      )}
      {feedback ? <FeedbackBanner value={feedback} /> : null}
      {!alerted ? (
        <View style={styles.sosArea}>
          <Pressable accessibilityHint="Mantenha pressionado por 3 segundos para acionar ajuda." accessibilityLabel="SOS" accessibilityRole="button" delayLongPress={3000} disabled={action === 'alert'} onLongPress={() => void handleAlert()} style={({ pressed }) => [styles.sosOuter, pressed && styles.sosPressed]}>
            <View style={styles.sosInner}>{action === 'alert' ? <ActivityIndicator color="#FFF" size="large" /> : <Text style={styles.sosText}>SOS</Text>}</View>
          </Pressable>
          <Text style={styles.hold}>Segure por 3 segundos para acionar ajuda</Text>
        </View>
      ) : null}
      <View style={styles.metrics}>
        <Metric icon="location-outline" label="Última localização" value={formatLocation(lastLocation)} />
        <Metric icon="time-outline" label="Última atualização" value={formatTime(lastSentAt)} />
        <Metric icon="radio-outline" label="Tracking" value={trackingLabel(isTracking, permissionStatus)} />
      </View>
      {locationError ? <FeedbackBanner value={{ message: locationError, error: true }} /> : null}
      {alerted ? <>
        <Primary disabled={action === 'complete'} icon="shield-checkmark-outline" label={action === 'complete' ? 'Encerrando proteção...' : 'Estou em segurança agora'} onPress={() => void handleComplete()} />
        <Pressable accessibilityRole="button" onPress={() => Alert.alert('Detalhes do alerta', `Status: Em andamento\nHorário: ${formatTime(alertAt)}${lastLocation ? '\nLocalização registrada.' : ''}`)} style={styles.link}><Text style={styles.linkText}>Ver detalhes do alerta</Text><Ionicons color="#7DD3FC" name="chevron-forward" size={16} /></Pressable>
      </> : null}
      <Secondary disabled={action === 'complete'} label="Desativar proteção" onPress={confirmComplete} />
    </Page>
  );
}

function Page({ children, compact = false, scroll = false }: { children: ReactNode; compact?: boolean; scroll?: boolean }) {
  const content = scroll ? <ScrollView contentContainerStyle={[styles.content, compact && styles.compact]} showsVerticalScrollIndicator={false}>{children}</ScrollView> : children;
  return <SafeAreaView style={styles.safe}><StatusBar style="light" />{content}</SafeAreaView>;
}
function StatePage({ children, loading = false, safe = false, text, title }: { children?: ReactNode; loading?: boolean; safe?: boolean; text?: string; title: string }) {
  return <Page><View style={styles.center}><Brand />{loading ? <ActivityIndicator color="#38BDF8" size="large" /> : <IconBubble alert={!safe} icon={safe ? 'checkmark-circle-outline' : 'warning-outline'} />}<Text style={styles.stateTitle}>{title}</Text>{text ? <Text style={styles.copy}>{text}</Text> : null}{children}</View></Page>;
}
function Brand() { return <View style={styles.brandRow}><View style={styles.logo}><Ionicons color="#7DD3FC" name="shield-checkmark-outline" size={20} /></View><Text style={styles.brand}>GUARDIAM</Text></View>; }
function Header({ onBack }: { onBack: () => void }) { return <View style={styles.header}><Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={onBack} style={styles.back}><Ionicons color="#E7F3FF" name="chevron-back" size={22} /></Pressable><Brand /><View style={styles.spacer} /></View>; }
function IconBubble({ alert = false, icon }: { alert?: boolean; icon: IconName }) { return <View style={[styles.icon, alert && styles.iconAlert]}><Ionicons color={alert ? '#FDA4AF' : '#86EFAC'} name={icon} size={32} /></View>; }
function Metric({ icon, label, value }: { icon: IconName; label: string; value: string }) { return <View style={styles.metric}><Ionicons color="#7DD3FC" name={icon} size={18} /><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={2} style={styles.metricValue}>{value}</Text></View>; }
function Primary({ disabled = false, icon, label, onPress }: { disabled?: boolean; icon: IconName; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primary, (pressed || disabled) && styles.dim]}><Ionicons color="#04111F" name={icon} size={22} /><Text style={styles.primaryText}>{label}</Text></Pressable>; }
function Secondary({ disabled = false, label, onPress }: { disabled?: boolean; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.secondary, (pressed || disabled) && styles.dim]}><Text style={styles.secondaryText}>{label}</Text></Pressable>; }
function FeedbackBanner({ value }: { value: Feedback }) { return <View style={[styles.feedback, value.error && styles.feedbackError]}><Ionicons color={value.error ? '#FDA4AF' : '#86EFAC'} name={value.error ? 'warning-outline' : 'checkmark-circle-outline'} size={18} /><Text style={[styles.feedbackText, value.error && styles.alertCopy]}>{value.message}</Text></View>; }

function formatLocation(value: { lat: number; lng: number } | null) { return value ? `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}` : 'Aguardando'; }
function formatTime(value: Date | null) {
  if (!value) return '--:--';

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}
function trackingLabel(active: boolean, permission: string | null) { return active ? 'Ativo' : permission === 'denied' ? 'Permissão necessária' : 'Preparando'; }
function requireToken(token: string | null) { if (!token) throw new Error('Sessão expirada. Faça login novamente.'); return token; }
function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Tente novamente em instantes.'; }
function isFinalStatus(status: TripStatus) { return ['ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status); }
function getGuardianProtectionStatus(status: TripStatus | undefined, ended: boolean) {
  if (ended || (status && isFinalStatus(status))) return 'ENDED' as const;
  if (status === 'ALERT_TRIGGERED') return 'ALERTED' as const;
  if (status === 'ACTIVE') return 'ACTIVE' as const;
  return 'INACTIVE' as const;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#04111F', flex: 1 }, content: { flexGrow: 1, padding: 20 }, compact: { paddingHorizontal: 18, paddingVertical: 14 }, center: { alignItems: 'center', flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }, back: { alignItems: 'center', backgroundColor: '#0F1D2C', borderRadius: 18, height: 42, justifyContent: 'center', width: 42 }, spacer: { width: 42 }, brandRow: { alignItems: 'center', flexDirection: 'row', gap: 9 }, logo: { alignItems: 'center', backgroundColor: '#0B2B43', borderRadius: 14, height: 38, justifyContent: 'center', width: 38 }, brand: { color: '#E7F3FF', fontSize: 20, fontWeight: '800', letterSpacing: 1.2 },
  hero: { alignItems: 'center', backgroundColor: '#081C30', borderColor: '#164867', borderRadius: 30, borderWidth: 1, marginBottom: 18, padding: 28 }, icon: { alignItems: 'center', backgroundColor: '#0D3B35', borderRadius: 28, height: 58, justifyContent: 'center', marginBottom: 12, width: 58 }, iconAlert: { backgroundColor: '#351522' }, eyebrow: { color: '#7DD3FC', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' }, title: { color: '#F8FAFC', fontSize: 28, fontWeight: '900', marginTop: 5 }, copy: { color: '#94A3B8', fontSize: 15, lineHeight: 22, textAlign: 'center' }, stateTitle: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', lineHeight: 31, textAlign: 'center' },
  card: { backgroundColor: '#081C30', borderColor: '#1D594B', borderRadius: 26, borderWidth: 1, padding: 16 }, alertCard: { backgroundColor: '#32101D', borderColor: '#7A263A' }, row: { alignItems: 'center', flexDirection: 'row', gap: 13 }, flex: { flex: 1 }, cardTitle: { color: '#F8FAFC', fontSize: 21, fontWeight: '900' }, cardCopy: { color: '#CBD5E1', fontSize: 13, marginTop: 3 }, status: { alignItems: 'center', backgroundColor: '#0F1D2C', borderRadius: 15, flexDirection: 'row', gap: 7, marginTop: 12, padding: 10 }, greenDot: { backgroundColor: '#86EFAC', borderRadius: 5, height: 9, width: 9 }, statusText: { color: '#CBD5E1', flex: 1, fontSize: 11 }, activeBadge: { backgroundColor: '#123D31', borderRadius: 12, color: '#BBF7D0', fontSize: 10, fontWeight: '800', padding: 6 }, alertEyebrow: { color: '#FDA4AF', fontSize: 11, fontWeight: '900' }, alertCopy: { color: '#FECDD3', fontSize: 13, lineHeight: 19 }, between: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }, meta: { color: '#CBD5E1', fontSize: 11 }, alertBadge: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#51182A', borderRadius: 12, flexDirection: 'row', gap: 7, marginTop: 11, padding: 7 }, redDot: { backgroundColor: '#FB7185', borderRadius: 4, height: 8, width: 8 }, alertBadgeText: { color: '#FECDD3', fontSize: 11, fontWeight: '800' },
  sosArea: { alignItems: 'center', marginVertical: 14 }, sosOuter: { alignItems: 'center', backgroundColor: '#351522', borderRadius: 70, height: 138, justifyContent: 'center', width: 138 }, sosInner: { alignItems: 'center', backgroundColor: '#E11D48', borderRadius: 55, height: 108, justifyContent: 'center', width: 108 }, sosPressed: { transform: [{ scale: 0.96 }] }, sosText: { color: '#FFF', fontSize: 30, fontWeight: '900' }, hold: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginTop: 8 },
  metrics: { flexDirection: 'row', gap: 7, marginBottom: 10 }, metric: { backgroundColor: '#0F1D2C', borderRadius: 17, flex: 1, minHeight: 91, padding: 10 }, metricLabel: { color: '#94A3B8', fontSize: 9, marginTop: 6 }, metricValue: { color: '#F8FAFC', fontSize: 10, fontWeight: '800', marginTop: 4 }, primary: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#38BDF8', borderRadius: 20, flexDirection: 'row', gap: 10, justifyContent: 'center', minHeight: 54, paddingHorizontal: 18 }, primaryText: { color: '#04111F', fontSize: 15, fontWeight: '900' }, secondary: { alignItems: 'center', alignSelf: 'stretch', borderColor: '#324153', borderRadius: 18, borderWidth: 1, justifyContent: 'center', marginTop: 10, minHeight: 48 }, secondaryText: { color: '#CBD5E1', fontSize: 14, fontWeight: '800' }, dim: { opacity: 0.65 }, link: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', padding: 10 }, linkText: { color: '#7DD3FC', fontSize: 13, fontWeight: '800' }, feedback: { alignItems: 'flex-start', backgroundColor: '#123D31', borderRadius: 15, flexDirection: 'row', gap: 8, marginVertical: 9, padding: 10 }, feedbackError: { backgroundColor: '#351522' }, feedbackText: { color: '#BBF7D0', flex: 1, fontSize: 12, lineHeight: 17 },
});
