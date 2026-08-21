import { ArrowLeft, Bell, Menu, X } from 'lucide-react-native';
import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { ApprovedLogo } from '../ui/ApprovedLogo';

export type ApprovedHeaderVariant = 'light' | 'dark' | 'emergency';

export interface ApprovedHeaderProps {
  variant?: ApprovedHeaderVariant;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  showNotification?: boolean;
  hasNotificationBadge?: boolean;
  onNotification?: () => void;
  showClose?: boolean;
  onClose?: () => void;
  title?: string;
  customCenter?: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export const ApprovedHeader: React.FC<ApprovedHeaderProps> = ({
  variant = 'light',
  showBack = false,
  onBack,
  showMenu = false,
  onMenu,
  showNotification = false,
  hasNotificationBadge = false,
  onNotification,
  showClose = false,
  onClose,
  title,
  customCenter,
  testID = 'approved-header',
  style,
}) => {
  const isDark = variant === 'dark';
  const isEmergency = variant === 'emergency';

  const iconColor = isEmergency ? '#FFFFFF' : isDark ? '#E2E8F0' : '#334155';
  const titleColor = isEmergency ? '#FFFFFF' : isDark ? '#FFFFFF' : '#0F172A';

  return (
    <View
      style={[
        styles.container,
        isEmergency
          ? styles.emergencyBackground
          : isDark
          ? styles.darkBackground
          : styles.lightBackground,
        style,
      ]}
      testID={testID}
    >
      {/* Left Slot: Back or Menu or Spacer */}
      <View style={styles.sideSlot}>
        {showBack ? (
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <ArrowLeft size={22} color={iconColor} strokeWidth={2.5} />
          </Pressable>
        ) : showMenu ? (
          <Pressable
            accessibilityLabel="Menu"
            accessibilityRole="button"
            onPress={onMenu}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Menu size={22} color={iconColor} strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>

      {/* Center Slot: Logo or Title */}
      <View style={styles.centerSlot}>
        {customCenter ? (
          customCenter
        ) : title ? (
          <Text numberOfLines={1} style={[styles.title, { color: titleColor }]}>
            {title}
          </Text>
        ) : (
          <ApprovedLogo size="sm" />
        )}
      </View>

      {/* Right Slot: Close or Notification or Spacer */}
      <View style={[styles.sideSlot, styles.rightSlot]}>
        {showClose ? (
          <Pressable
            accessibilityLabel="Fechar"
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <X size={22} color={iconColor} strokeWidth={2.5} />
          </Pressable>
        ) : showNotification ? (
          <Pressable
            accessibilityLabel="Notificações"
            accessibilityRole="button"
            onPress={onNotification}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Bell size={22} color={iconColor} />
            {hasNotificationBadge ? <View style={styles.notificationDot} /> : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
  },
  lightBackground: {
    backgroundColor: 'transparent',
  },
  darkBackground: {
    backgroundColor: '#0A1128',
  },
  emergencyBackground: {
    backgroundColor: '#DC2626',
  },
  sideSlot: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 44,
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  centerSlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    width: 38,
  },
  pressed: {
    opacity: 0.6,
  },
  notificationDot: {
    backgroundColor: '#EF4444',
    borderColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1.5,
    height: 8,
    position: 'absolute',
    right: 8,
    top: 6,
    width: 8,
  },
});
