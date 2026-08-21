import { ChevronRight } from 'lucide-react-native';
import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export interface ApprovedSettingItemProps {
  icon: ReactNode;
  label: string;
  badge?: string;
  badgeColor?: string;
  onPress?: () => void;
  testID?: string;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ApprovedSettingItem: React.FC<ApprovedSettingItemProps> = ({
  icon,
  label,
  badge,
  badgeColor,
  onPress,
  testID,
  isDark = false,
  style,
}) => {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isDark && styles.darkContainer,
        pressed && styles.pressed,
        style,
      ]}
      testID={testID}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={[styles.label, isDark && styles.darkText]}>{label}</Text>
      </View>

      <View style={styles.rightRow}>
        {badge ? (
          <View
            style={[
              styles.badgeBox,
              badgeColor ? { backgroundColor: badgeColor } : styles.defaultBadgeBox,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                badgeColor ? { color: '#FFFFFF' } : styles.defaultBadgeText,
              ]}
            >
              {badge}
            </Text>
          </View>
        ) : null}
        <ChevronRight size={18} color={isDark ? '#64748B' : '#94A3B8'} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    width: '100%',
  },
  darkContainer: {
    borderBottomColor: 'rgba(30, 41, 59, 0.8)',
  },
  leftRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  darkText: {
    color: '#E2E8F0',
  },
  rightRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  badgeBox: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeBox: {
    backgroundColor: '#E3F2FD',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  defaultBadgeText: {
    color: '#1565C0',
  },
  pressed: {
    opacity: 0.7,
  },
});
