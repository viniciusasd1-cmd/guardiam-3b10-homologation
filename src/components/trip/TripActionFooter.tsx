import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../AppButton';
import { colors } from '../../constants/colors';

type TripActionFooterProps = {
  isTripFinished: boolean;
  isTripInProgress: boolean;
  loadingComplete: boolean;
  loadingStart: boolean;
  onComplete: () => void;
  onStart: () => void;
};

export function TripActionFooter({
  isTripFinished,
  isTripInProgress,
  loadingComplete,
  loadingStart,
  onComplete,
  onStart,
}: TripActionFooterProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isTripFinished ? 'Viagem encerrada' : 'Ações da viagem'}
      </Text>
      <Text style={styles.helperText}>
        {getHelperText(isTripFinished, isTripInProgress)}
      </Text>

      {!isTripInProgress && !isTripFinished ? (
        <AppButton
          icon="play-outline"
          loading={loadingStart}
          onPress={onStart}
          title="Iniciar viagem"
        />
      ) : null}

      {isTripInProgress ? (
        <AppButton
          icon="checkmark-circle-outline"
          loading={loadingComplete}
          onPress={onComplete}
          title="Finalizar viagem"
          variant="secondary"
        />
      ) : null}
    </View>
  );
}

function getHelperText(isTripFinished: boolean, isTripInProgress: boolean) {
  if (isTripFinished) {
    return 'A viagem foi finalizada e novos envios foram bloqueados.';
  }

  if (isTripInProgress) {
    return 'Finalize somente quando estiver em segurança no destino.';
  }

  return 'Inicie a viagem para liberar localização real, tracking e alerta silencioso.';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
