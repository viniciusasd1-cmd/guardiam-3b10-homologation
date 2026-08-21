import { CheckCircle2, Mic } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export interface ApprovedAudioEvidenceRecorderProps {
  isDark?: boolean;
  isRecording?: boolean;
  dossierId?: string;
  onToggleRecording?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const BAR_HEIGHTS = [8, 14, 20, 10, 18, 12, 6, 16, 20, 10, 14, 8];

export const ApprovedAudioEvidenceRecorder: React.FC<ApprovedAudioEvidenceRecorderProps> = ({
  isDark = true,
  isRecording = true,
  dossierId = 'EV-2026-9841',
  onToggleRecording,
  style,
  testID = 'audio-evidence-recorder',
}) => {
  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
        style,
      ]}
      testID={testID}
    >
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          <View
            style={[
              styles.iconBubble,
              isRecording ? styles.recordingBubble : styles.idleBubble,
            ]}
          >
            <Mic size={18} color={isRecording ? '#EF4444' : '#38BDF8'} />
          </View>
          <View style={styles.titleCol}>
            <Text style={[styles.title, isDark && styles.darkText]}>
              Custódia de Áudio Contínua
            </Text>
            <Text style={styles.dossierText}>Dossiê #{dossierId}</Text>
          </View>
        </View>

        {onToggleRecording ? (
          <Pressable
            accessibilityLabel={isRecording ? 'Pausar gravação' : 'Gravar áudio'}
            accessibilityRole="button"
            onPress={onToggleRecording}
            style={({ pressed }) => [
              styles.toggleButton,
              isRecording ? styles.recordingButton : styles.idleButton,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.toggleButtonText,
                isRecording ? styles.recordingButtonText : styles.idleButtonText,
              ]}
            >
              {isRecording ? 'Pausar' : 'Gravar'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Waveform Visualization */}
      {isRecording ? (
        <View
          style={[
            styles.bottomRow,
            isDark ? styles.darkDivider : styles.lightDivider,
          ]}
        >
          <View style={styles.waveBars}>
            {BAR_HEIGHTS.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { height: h },
                  i % 2 === 0 ? styles.waveBarActive : styles.waveBarDim,
                ]}
              />
            ))}
          </View>

          <View style={styles.secRow}>
            <CheckCircle2 size={13} color="#10B981" />
            <Text style={styles.secText}>Criptografia AES-256</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  darkContainer: {
    backgroundColor: '#101C42',
    borderColor: 'rgba(30, 58, 138, 0.6)',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftCol: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    marginRight: 8,
  },
  iconBubble: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  recordingBubble: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  idleBubble: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  darkText: {
    color: '#FFFFFF',
  },
  dossierText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  toggleButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recordingButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  idleButton: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recordingButtonText: {
    color: '#EF4444',
  },
  idleButtonText: {
    color: '#38BDF8',
  },
  pressed: {
    opacity: 0.7,
  },
  bottomRow: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
  },
  lightDivider: {
    borderTopColor: '#F1F5F9',
  },
  darkDivider: {
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
  },
  waveBars: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    height: 20,
  },
  waveBar: {
    borderRadius: 2,
    width: 3,
  },
  waveBarActive: {
    backgroundColor: '#F87171',
  },
  waveBarDim: {
    backgroundColor: '#FCA5A5',
  },
  secRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  secText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
});
