import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { SafeTrip, TripStatus, TripType } from '../../types/safeTrip';

type ActiveTripSummaryCardProps = {
  safeTrip: SafeTrip;
};

export function ActiveTripSummaryCard({ safeTrip }: ActiveTripSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Resumo da viagem</Text>
          <Text style={styles.title}>
            {safeTrip.destinationName ?? 'Viagem segura'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getTripStatusLabel(safeTrip.status)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <InfoRow label="Origem" value={safeTrip.originAddress ?? 'Não informada'} />
      <InfoRow
        label="Destino"
        value={safeTrip.destinationAddress ?? 'Destino ainda sem endereço detalhado'}
      />
      <View style={styles.twoColumn}>
        <InfoRow compact label="Tipo" value={getTripTypeLabel(safeTrip.tripType)} />
        <InfoRow compact label="Início" value={formatDateTime(safeTrip.startedAt)} />
      </View>
    </View>
  );
}

function InfoRow({
  compact,
  label,
  value,
}: {
  compact?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.infoRow, compact && styles.infoRowCompact]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function getTripStatusLabel(status: TripStatus) {
  const labels: Record<TripStatus, string> = {
    ACTIVE: 'Ativa',
    ALERT_TRIGGERED: 'Alerta acionado',
    ARRIVED: 'Finalizada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Finalizada',
    DRAFT: 'Criada',
    EXPIRED: 'Expirada',
    PREPARING: 'Preparando',
  };

  return labels[status];
}

function getTripTypeLabel(type: TripType) {
  const labels: Record<TripType, string> = {
    HOTEL: 'Hotel',
    LOCAL_TRIP: 'Deslocamento local',
    OTHER: 'Outro',
    RIDE_APP: 'App de transporte',
    TAXI: 'Táxi',
    TOURISM: 'Turismo',
    TRANSFER: 'Transfer',
  };

  return labels[type];
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Ainda não iniciada';
  }

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
    gap: 13,
    padding: 16,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
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
  statusBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#99F6E4',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  infoRow: {
    gap: 4,
  },
  infoRowCompact: {
    flex: 1,
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
    fontWeight: '700',
    lineHeight: 21,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 14,
  },
});
