import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { ForegroundLocationPermissionStatus } from '../../location/locationService';
import { SafeTrip } from '../../types/safeTrip';

type TimelineState = 'complete' | 'current' | 'pending' | 'warning';

type TimelineItem = {
  description: string;
  label: string;
  state: TimelineState;
};

type TripTimelineProps = {
  alertSent: boolean;
  isTracking: boolean;
  lastSentAt: Date | null;
  permissionStatus: ForegroundLocationPermissionStatus;
  safeTrip: SafeTrip;
};

export function TripTimeline({
  alertSent,
  isTracking,
  lastSentAt,
  permissionStatus,
  safeTrip,
}: TripTimelineProps) {
  const items = buildTimelineItems({
    alertSent,
    isTracking,
    lastSentAt,
    permissionStatus,
    safeTrip,
  });

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.eyebrow}>Linha do tempo</Text>
        <Text style={styles.title}>Acompanhamento da viagem</Text>
      </View>

      <View style={styles.timeline}>
        {items.map((item, index) => (
          <View key={`${item.label}-${index}`} style={styles.timelineItem}>
            <View style={styles.markerColumn}>
              <View style={[styles.marker, styles[item.state]]} />
              {index < items.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function buildTimelineItems({
  alertSent,
  isTracking,
  lastSentAt,
  permissionStatus,
  safeTrip,
}: TripTimelineProps): TimelineItem[] {
  const hasLocationPermission = permissionStatus === 'granted';
  const hasLocationActivity = hasLocationPermission || isTracking || Boolean(lastSentAt);
  const isFinished = ['ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(
    safeTrip.status,
  );

  const items: TimelineItem[] = [
    {
      description: formatDateTime(safeTrip.createdAt),
      label: 'Viagem criada',
      state: 'complete',
    },
    {
      description: safeTrip.startedAt
        ? formatDateTime(safeTrip.startedAt)
        : 'Aguardando início pelo app.',
      label: 'Viagem iniciada',
      state: safeTrip.startedAt ? 'complete' : 'pending',
    },
    {
      description: hasLocationActivity
        ? getLocationDescription(isTracking, hasLocationPermission)
        : 'Aguardando ativação da localização real.',
      label: 'Localização ativada',
      state: hasLocationActivity ? (isTracking ? 'current' : 'complete') : 'pending',
    },
    {
      description: lastSentAt
        ? lastSentAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : 'Nenhum envio real registrado nesta tela.',
      label: 'Última localização enviada',
      state: lastSentAt ? 'complete' : 'pending',
    },
  ];

  if (alertSent) {
    items.push({
      description: 'Alerta silencioso registrado para a viagem.',
      label: 'Alerta acionado',
      state: 'warning',
    });
  }

  if (isFinished) {
    items.push({
      description: safeTrip.endedAt
        ? formatDateTime(safeTrip.endedAt)
        : 'Finalização registrada pelo app.',
      label: 'Viagem finalizada',
      state: 'complete',
    });
  }

  return items;
}

function getLocationDescription(isTracking: boolean, hasPermission: boolean) {
  if (isTracking) {
    return 'Tracking automático em primeiro plano ativo.';
  }

  if (hasPermission) {
    return 'Permissão concedida. Tracking pode ser ativado.';
  }

  return 'Localização real usada nesta viagem.';
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
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
    marginTop: 4,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  markerColumn: {
    alignItems: 'center',
    width: 18,
  },
  marker: {
    borderRadius: 999,
    height: 14,
    marginTop: 3,
    width: 14,
  },
  complete: {
    backgroundColor: colors.primary,
  },
  current: {
    backgroundColor: colors.success,
  },
  pending: {
    backgroundColor: '#CBD5E1',
  },
  warning: {
    backgroundColor: colors.warning,
  },
  line: {
    backgroundColor: colors.border,
    flex: 1,
    minHeight: 30,
    width: 2,
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: 16,
  },
  itemLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  itemDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
});
