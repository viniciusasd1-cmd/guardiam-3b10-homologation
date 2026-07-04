import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { TripStatus } from '../../types/safeTrip';

type ProtectionStage = 'created' | 'active' | 'location' | 'alert' | 'finished';

type ProtectionStatusCardProps = {
  alertSent: boolean;
  isTracking: boolean;
  tripStatus: TripStatus;
};

const stages: { key: ProtectionStage; label: string }[] = [
  { key: 'created', label: 'Viagem criada' },
  { key: 'active', label: 'Viagem ativa' },
  { key: 'location', label: 'Localização ativa' },
  { key: 'alert', label: 'Alerta acionado' },
  { key: 'finished', label: 'Viagem finalizada' },
];

export function ProtectionStatusCard({
  alertSent,
  isTracking,
  tripStatus,
}: ProtectionStatusCardProps) {
  const activeStage = getActiveStage(tripStatus, isTracking, alertSent);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Ionicons color="#FFFFFF" name="shield-checkmark-outline" size={24} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>XGuardiam Ride</Text>
          <Text style={styles.title}>Proteção ativa</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>{getSubtitle(activeStage)}</Text>

      <View style={styles.stageGrid}>
        {stages.map((stage) => {
          const isActive = stage.key === activeStage;

          return (
            <View
              key={stage.key}
              style={[styles.stageChip, isActive && styles.stageChipActive]}
            >
              <View style={[styles.stageDot, isActive && styles.stageDotActive]} />
              <Text style={[styles.stageText, isActive && styles.stageTextActive]}>
                {stage.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getActiveStage(
  status: TripStatus,
  isTracking: boolean,
  alertSent: boolean,
): ProtectionStage {
  if (isFinalStatus(status)) {
    return 'finished';
  }

  if (alertSent || status === 'ALERT_TRIGGERED') {
    return 'alert';
  }

  if (isTracking) {
    return 'location';
  }

  if (status === 'ACTIVE') {
    return 'active';
  }

  return 'created';
}

function getSubtitle(stage: ProtectionStage) {
  if (stage === 'finished') {
    return 'Viagem encerrada. O tracking em primeiro plano foi interrompido.';
  }

  if (stage === 'alert') {
    return 'Alerta silencioso enviado. Mantenha o app aberto enquanto finaliza sua rota.';
  }

  if (stage === 'location') {
    return 'Sua viagem está sendo monitorada com localização real em primeiro plano.';
  }

  if (stage === 'active') {
    return 'Viagem em andamento. Ative a localização real para iniciar o envio automático.';
  }

  return 'Sua viagem está pronta para ser iniciada e monitorada com segurança.';
}

function isFinalStatus(status: TripStatus) {
  return ['ARRIVED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: 8,
    gap: 16,
    padding: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: '#9CE3D9',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#D5DEE8',
    fontSize: 15,
    lineHeight: 22,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stageChip: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderColor: '#334155',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stageChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#99F6E4',
  },
  stageDot: {
    backgroundColor: '#94A3B8',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  stageDotActive: {
    backgroundColor: colors.primary,
  },
  stageText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  stageTextActive: {
    color: colors.primaryDark,
  },
});
