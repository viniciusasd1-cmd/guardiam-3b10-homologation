import { StyleSheet, Text, View } from 'react-native';
import { TripLocationInput } from '../../api/safeTripsApi';
import { AppButton } from '../AppButton';
import { colors } from '../../constants/colors';
import { ForegroundLocationPermissionStatus } from '../../location/locationService';

type LocationTrackingCardProps = {
  error: string | null;
  isTripFinished: boolean;
  isTripInProgress: boolean;
  isTracking: boolean;
  lastLocation: TripLocationInput | null;
  lastSentAt: Date | null;
  loadingSendNow: boolean;
  loadingTracking: boolean;
  onSendNow: () => void;
  onStartTracking: () => void;
  permissionStatus: ForegroundLocationPermissionStatus;
};

export function LocationTrackingCard({
  error,
  isTripFinished,
  isTripInProgress,
  isTracking,
  lastLocation,
  lastSentAt,
  loadingSendNow,
  loadingTracking,
  onSendNow,
  onStartTracking,
  permissionStatus,
}: LocationTrackingCardProps) {
  const actionsDisabled = !isTripInProgress || isTripFinished;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>GPS em primeiro plano</Text>
          <Text style={styles.title}>Localização real</Text>
        </View>
        <View style={[styles.trackingBadge, isTracking && styles.trackingBadgeActive]}>
          <Text
            style={[
              styles.trackingBadgeText,
              isTracking && styles.trackingBadgeTextActive,
            ]}
          >
            {isTracking ? 'Tracking ativo' : 'Tracking parado'}
          </Text>
        </View>
      </View>

      <Text style={styles.helperText}>
        O app envia sua posição real a cada 15 segundos enquanto a viagem está ativa
        e a tela permanece aberta.
      </Text>

      <View style={styles.statusGrid}>
        <InfoBlock label="Permissão" value={getPermissionLabel(permissionStatus)} />
        <InfoBlock label="Último envio" value={formatTime(lastSentAt)} />
      </View>

      <View style={styles.locationBox}>
        <InfoBlock
          label="Latitude"
          value={lastLocation ? lastLocation.latitude.toFixed(6) : 'Ainda não enviada'}
        />
        <InfoBlock
          label="Longitude"
          value={lastLocation ? lastLocation.longitude.toFixed(6) : 'Ainda não enviada'}
        />
        <InfoBlock label="Precisão" value={formatAccuracy(lastLocation?.accuracy)} />
      </View>

      {permissionStatus === 'denied' ? (
        <Text style={styles.errorText}>
          Permissão negada. Abra as configurações do aparelho e libere localização
          para o Expo Go.
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!isTripInProgress && !isTripFinished ? (
        <Text style={styles.helperText}>
          Inicie a viagem para ativar o tracking automático.
        </Text>
      ) : null}

      {isTripFinished ? (
        <Text style={styles.helperText}>
          Viagem finalizada. Novos envios de localização estão bloqueados.
        </Text>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          disabled={actionsDisabled || isTracking}
          icon="navigate-outline"
          loading={loadingTracking}
          onPress={onStartTracking}
          title={isTracking ? 'Localização real ativa' : 'Ativar localização real'}
          variant="secondary"
        />
        <AppButton
          disabled={actionsDisabled}
          icon="locate-outline"
          loading={loadingSendNow}
          onPress={onSendNow}
          title="Enviar localização agora"
          variant="secondary"
        />
      </View>
    </View>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function getPermissionLabel(status: ForegroundLocationPermissionStatus) {
  if (status === 'granted') {
    return 'Permitida';
  }

  if (status === 'denied') {
    return 'Negada';
  }

  return 'Não solicitada';
}

function formatAccuracy(value?: number | null) {
  if (value === null || value === undefined) {
    return 'Não informada';
  }

  return `${Math.round(value)} m`;
}

function formatTime(value: Date | null) {
  if (!value) {
    return 'Nenhum envio nesta tela';
  }

  return value.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  trackingBadge: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trackingBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#99F6E4',
  },
  trackingBadgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  trackingBadgeTextActive: {
    color: colors.primaryDark,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  locationBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: 12,
    padding: 14,
  },
  infoBlock: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
});
