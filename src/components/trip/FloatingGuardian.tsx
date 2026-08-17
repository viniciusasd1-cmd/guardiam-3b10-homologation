import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const HOLD_MS = 3000;
const TICK_MS = 50;

type FloatingGuardianProps = {
  disabled?: boolean;
  confirmed?: boolean;
  onTrigger: () => void;
};

export function FloatingGuardian({ disabled = false, confirmed = false, onTrigger }: FloatingGuardianProps) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);
  const triggered = useRef(false);

  useEffect(() => () => stopTimer(), []);

  function stopTimer() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }

  function cancel() {
    stopTimer();
    if (!triggered.current) setProgress(0);
  }

  function begin() {
    if (disabled || confirmed) return;
    triggered.current = false;
    startedAt.current = Date.now();
    setProgress(0);
    timer.current = setInterval(() => {
      const next = Math.min((Date.now() - startedAt.current) / HOLD_MS, 1);
      setProgress(next);
      if (next >= 1) {
        stopTimer();
        if (!triggered.current) {
          triggered.current = true;
          onTrigger();
        }
      }
    }, TICK_MS);
  }

  const busy = disabled || confirmed;
  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <Pressable
        accessibilityLabel={confirmed ? 'GUARDIAM: SOS acionado' : 'Floating Guardian GUARDIAM'}
        accessibilityHint="Pressione e segure por 3 segundos para acionar o SOS. Solte antes para cancelar."
        accessibilityRole="button"
        accessibilityState={{ busy, disabled: busy }}
        disabled={busy}
        onPressIn={begin}
        onPressOut={cancel}
        style={({ pressed }) => [styles.button, pressed && styles.pressed, busy && styles.busy]}
      >
        <View style={[styles.progress, { width: `${Math.round(progress * 100)}%` }]} />
        <Ionicons color={confirmed ? '#86EFAC' : '#7DD3FC'} name={confirmed ? 'checkmark-circle-outline' : 'shield-checkmark-outline'} size={22} />
        <Text style={styles.label}>{confirmed ? 'SOS acionado' : 'GUARDIAN'}</Text>
      </Pressable>
      {!busy && progress > 0 ? <Text style={styles.feedback}>Segure... {Math.ceil((HOLD_MS - progress * HOLD_MS) / 1000)}s</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { alignItems: 'flex-end', minHeight: 58, marginBottom: 6 },
  button: { alignItems: 'center', backgroundColor: '#0B2B43', borderColor: '#28739A', borderRadius: 19, borderWidth: 1, elevation: 4, flexDirection: 'row', gap: 8, minHeight: 52, minWidth: 132, overflow: 'hidden', paddingHorizontal: 14, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
  progress: { backgroundColor: '#164867', bottom: 0, left: 0, opacity: 0.9, position: 'absolute', top: 0 },
  pressed: { transform: [{ scale: 0.97 }] },
  busy: { opacity: 0.72 },
  label: { color: '#E7F3FF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  feedback: { color: '#7DD3FC', fontSize: 11, fontWeight: '800', marginTop: 3 },
});
