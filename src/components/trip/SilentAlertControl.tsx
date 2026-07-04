import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../constants/colors';

type SilentAlertControlProps = {
  alertSent: boolean;
  disabled: boolean;
  disabledReason?: string;
  error: string | null;
  loading: boolean;
  onTrigger: () => void;
};

export function SilentAlertControl({
  alertSent,
  disabled,
  disabledReason,
  error,
  loading,
  onTrigger,
}: SilentAlertControlProps) {
  const isDisabled = disabled || loading || alertSent;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Ionicons color={colors.danger} name="shield-outline" size={22} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Alerta silencioso</Text>
          <Text style={styles.subtitle}>
            Use se sentir que precisa avisar seus contatos.
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityHint="Pressione e segure para acionar o alerta silencioso."
        accessibilityRole="button"
        delayLongPress={900}
        disabled={isDisabled}
        onLongPress={onTrigger}
        style={({ pressed }) => [
          styles.alertButton,
          alertSent && styles.alertButtonSent,
          isDisabled && styles.alertButtonDisabled,
          pressed && !isDisabled && styles.alertButtonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons
              color={alertSent ? colors.success : colors.danger}
              name={alertSent ? 'checkmark-circle-outline' : 'radio-outline'}
              size={20}
            />
            <Text style={[styles.alertButtonText, alertSent && styles.sentText]}>
              {alertSent ? 'Alerta enviado' : 'Pressione e segure para acionar'}
            </Text>
          </View>
        )}
      </Pressable>

      {disabledReason && !alertSent ? (
        <Text style={styles.helperText}>{disabledReason}</Text>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF7F7',
    borderColor: '#FECACA',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  alertButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FCA5A5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  alertButtonSent: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },
  alertButtonDisabled: {
    opacity: 0.72,
  },
  alertButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  alertButtonText: {
    color: colors.danger,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  sentText: {
    color: colors.success,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
