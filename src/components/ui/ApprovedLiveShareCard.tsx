import { Check, Copy, Eye, Share2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export interface ApprovedLiveShareCardProps {
  trackingUrl?: string;
  accessCount?: number;
  lastAccessTime?: string;
  isDark?: boolean;
  onShare?: () => void;
  onCopy?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ApprovedLiveShareCard: React.FC<ApprovedLiveShareCardProps> = ({
  trackingUrl = 'https://guardiam.app/track/tk_78x9a2',
  accessCount = 2,
  lastAccessTime = 'Há 2 min',
  isDark = true,
  onShare,
  onCopy,
  style,
  testID = 'live-share-card',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPress = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

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
          <View style={styles.iconBubble}>
            <Share2 size={16} color="#38BDF8" />
          </View>
          <View style={styles.titleCol}>
            <Text style={[styles.title, isDark && styles.darkText]}>
              Link de Rastreamento ao Vivo
            </Text>
            <Text numberOfLines={1} style={styles.urlText}>
              {trackingUrl}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel={copied ? 'Copiado' : 'Copiar link'}
          accessibilityRole="button"
          onPress={onShare || handleCopyPress}
          style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
        >
          {copied ? (
            <Check size={14} color="#FFFFFF" />
          ) : (
            <Copy size={14} color="#FFFFFF" />
          )}
          <Text style={styles.copyButtonText}>
            {copied ? 'Copiado' : 'Copiar'}
          </Text>
        </Pressable>
      </View>

      {/* Access Log Audit */}
      <View
        style={[
          styles.bottomRow,
          isDark ? styles.darkDivider : styles.lightDivider,
        ]}
      >
        <View style={styles.statRow}>
          <Eye size={14} color="#38BDF8" />
          <Text style={styles.statText}>
            {accessCount} visualizações registradas
          </Text>
        </View>
        <Text style={styles.statText}>Último: {lastAccessTime}</Text>
      </View>
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
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
  urlText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  copyButton: {
    alignItems: 'center',
    backgroundColor: '#1565C0',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
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
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  statText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
