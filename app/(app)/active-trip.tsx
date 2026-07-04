import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  completeTrip,
  getActiveTrip,
  getSafeTrip,
  startTrip,
  triggerPanicAlert,
} from '../../src/api/safeTripsApi';
import { useAuth } from '../../src/auth/AuthContext';
import { Screen } from '../../src/components/Screen';
import { ActiveTripSummaryCard } from '../../src/components/trip/ActiveTripSummaryCard';
import { LocationTrackingCard } from '../../src/components/trip/LocationTrackingCard';
import { ProtectionStatusCard } from '../../src/components/trip/ProtectionStatusCard';
import { SilentAlertControl } from '../../src/components/trip/SilentAlertControl';
import { TripActionFooter } from '../../src/components/trip/TripActionFooter';
import { TripTimeline } from '../../src/components/trip/TripTimeline';
import { colors } from '../../src/constants/colors';
import { useTripLocationTracking } from '../../src/location/useTripLocationTracking';
import { SafeTrip, TripStatus } from '../../src/types/safeTrip';

type LoadingAction = 'alert' | 'complete' | 'realLocation' | 'start' | 'tracking';
type FeedbackTone = 'error' | 'info' | 'success';

type Feedback = {
  message: string;
  tone: FeedbackTone;
};

export default function ActiveTripScreen() {
  const { safeTripId } = useLocalSearchParams<{ safeTripId?: string }>();
  const { accessToken } = useAuth();
  const [safeTrip, setSafeTrip] = useState<SafeTrip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [loadingAction, setLoadingAction] = useState<LoadingAction | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [alertSentLocally, setAlertSentLocally] = useState(false);

  const isTripInProgress =
    safeTrip?.status === 'ACTIVE' || safeTrip?.status === 'ALERT_TRIGGERED';
  const isTripFinished = safeTrip ? isFinalTripStatus(safeTrip.status) : false;
  const alertSent =
    Boolean(safeTrip?.status === 'ALERT_TRIGGERED') || alertSentLocally;

  const {
    permissionStatus,
    isTracking,
    lastLocation,
    lastSentAt,
    error: locationError,
    sendCurrentLocation,
    startTracking,
    stopTracking,
  } = useTripLocationTracking({
    accessToken,
    safeTripId: safeTrip?.id,
    isTripActive: isTripInProgress,
  });

  const loadTrip = useCallback(
    async (showLoading = false) => {
      if (!accessToken) {
        setIsLoadingTrip(false);
        return;
      }

      if (showLoading) {
        setIsLoadingTrip(true);
      }

      try {
        const trip = safeTripId
          ? await getSafeTrip(accessToken, safeTripId)
          : await getActiveTrip(accessToken);
        setSafeTrip(trip);
      } catch {
        setSafeTrip(null);

        if (safeTripId) {
          setFeedback({
            message: 'Não foi possível carregar esta viagem segura.',
            tone: 'error',
          });
        }
      } finally {
        setIsLoadingTrip(false);
      }
    },
    [accessToken, safeTripId],
  );

  useEffect(() => {
    void loadTrip(true);
  }, [loadTrip]);

  useEffect(() => {
    setAlertError(null);
    setAlertSentLocally(false);
  }, [safeTrip?.id]);

  async function runTripAction(
    name: LoadingAction,
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setLoadingAction(name);
    setFeedback(null);

    try {
      await action();
      await loadTrip();
      setFeedback({ message: successMessage, tone: 'success' });
    } catch (error) {
      setFeedback({ message: getErrorMessage(error), tone: 'error' });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleStartTrip() {
    if (!safeTrip) {
      return;
    }

    await runTripAction(
      'start',
      () => startTrip(requireAccessToken(accessToken), safeTrip.id),
      'Viagem iniciada. Ative a localização real para começar o tracking automático.',
    );
  }

  async function handleStartTracking() {
    setLoadingAction('tracking');
    setFeedback(null);

    try {
      const started = await startTracking();

      if (!started) {
        throw new Error('Não foi possível ativar a localização real agora.');
      }

      setFeedback({
        message: 'Localização real ativa. O app enviará sua posição a cada 15 segundos.',
        tone: 'success',
      });
    } catch (error) {
      setFeedback({ message: getErrorMessage(error), tone: 'error' });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSendCurrentLocation() {
    setLoadingAction('realLocation');
    setFeedback(null);

    try {
      const location = await sendCurrentLocation();

      if (!location) {
        throw new Error('Verifique a permissão de localização e tente novamente.');
      }

      setFeedback({
        message: 'Localização real enviada com sucesso.',
        tone: 'success',
      });
    } catch (error) {
      setFeedback({ message: getErrorMessage(error), tone: 'error' });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleTriggerSilentAlert() {
    if (!safeTrip || alertSent || !isTripInProgress) {
      return;
    }

    setLoadingAction('alert');
    setAlertError(null);
    setFeedback(null);

    try {
      await triggerPanicAlert(requireAccessToken(accessToken), safeTrip.id);
      setAlertSentLocally(true);
      await loadTrip();
      setFeedback({
        message: 'Alerta silencioso enviado.',
        tone: 'success',
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setAlertError(message);
      setFeedback({
        message: 'Não foi possível enviar o alerta. Tente novamente em instantes.',
        tone: 'error',
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleCompleteTrip() {
    if (!safeTrip) {
      return;
    }

    await runTripAction(
      'complete',
      async () => {
        stopTracking();
        await completeTrip(requireAccessToken(accessToken), safeTrip.id);
      },
      'Viagem finalizada. O tracking foi encerrado.',
    );
  }

  if (isLoadingTrip && !safeTrip) {
    return (
      <Screen>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Carregando viagem segura</Text>
          <Text style={styles.emptyText}>
            Estamos buscando os dados da proteção ativa.
          </Text>
        </View>
      </Screen>
    );
  }

  if (!safeTrip) {
    return (
      <Screen>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhuma viagem ativa</Text>
          <Text style={styles.emptyText}>
            Crie uma viagem segura para habilitar localização real, tracking e
            alerta silencioso.
          </Text>
        </View>
        {feedback ? <FeedbackBanner feedback={feedback} /> : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <ProtectionStatusCard
        alertSent={alertSent}
        isTracking={isTracking}
        tripStatus={safeTrip.status}
      />

      {feedback ? <FeedbackBanner feedback={feedback} /> : null}

      <ActiveTripSummaryCard safeTrip={safeTrip} />

      <LocationTrackingCard
        error={locationError}
        isTripFinished={isTripFinished}
        isTripInProgress={isTripInProgress}
        isTracking={isTracking}
        lastLocation={lastLocation}
        lastSentAt={lastSentAt}
        loadingSendNow={loadingAction === 'realLocation'}
        loadingTracking={loadingAction === 'tracking'}
        onSendNow={handleSendCurrentLocation}
        onStartTracking={handleStartTracking}
        permissionStatus={permissionStatus}
      />

      <SilentAlertControl
        alertSent={alertSent}
        disabled={!isTripInProgress || isTripFinished || !accessToken}
        disabledReason={getAlertDisabledReason(
          Boolean(accessToken),
          isTripFinished,
          isTripInProgress,
        )}
        error={alertError}
        loading={loadingAction === 'alert'}
        onTrigger={handleTriggerSilentAlert}
      />

      <TripTimeline
        alertSent={alertSent}
        isTracking={isTracking}
        lastSentAt={lastSentAt}
        permissionStatus={permissionStatus}
        safeTrip={safeTrip}
      />

      <TripActionFooter
        isTripFinished={isTripFinished}
        isTripInProgress={isTripInProgress}
        loadingComplete={loadingAction === 'complete'}
        loadingStart={loadingAction === 'start'}
        onComplete={handleCompleteTrip}
        onStart={handleStartTrip}
      />
    </Screen>
  );
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  return (
    <View style={[styles.feedback, getFeedbackStyle(feedback.tone)]}>
      <Text style={[styles.feedbackText, feedback.tone === 'error' && styles.errorText]}>
        {feedback.message}
      </Text>
    </View>
  );
}

function getFeedbackStyle(tone: FeedbackTone) {
  if (tone === 'success') {
    return styles.feedbackSuccess;
  }

  if (tone === 'error') {
    return styles.feedbackError;
  }

  return styles.feedbackInfo;
}

function getAlertDisabledReason(
  hasAccessToken: boolean,
  isTripFinished: boolean,
  isTripInProgress: boolean,
) {
  if (!hasAccessToken) {
    return 'Sessão expirada. Faça login novamente para enviar alertas.';
  }

  if (isTripFinished) {
    return 'Viagem finalizada. O alerta silencioso está bloqueado.';
  }

  if (!isTripInProgress) {
    return 'Inicie a viagem para liberar o alerta silencioso.';
  }

  return undefined;
}

function requireAccessToken(accessToken: string | null) {
  if (!accessToken) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return accessToken;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente em instantes.';
}

function isFinalTripStatus(status: TripStatus) {
  return ['ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status);
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  feedback: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  feedbackInfo: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  feedbackText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  errorText: {
    color: colors.danger,
  },
});
