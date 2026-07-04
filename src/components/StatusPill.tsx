import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type StatusPillProps = {
  label: string;
  tone?: 'ready' | 'warning' | 'danger' | 'neutral';
};

export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  return (
    <View style={[styles.pill, styles[tone]]}>
      <Text style={[styles.text, tone === 'neutral' && styles.neutralText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ready: {
    backgroundColor: '#DCFCE7',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  danger: {
    backgroundColor: '#FEE2E2',
  },
  neutral: {
    backgroundColor: colors.surfaceMuted,
  },
  text: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '800',
  },
  neutralText: {
    color: colors.textMuted,
  },
});
