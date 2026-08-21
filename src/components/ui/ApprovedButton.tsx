import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export type ApprovedButtonVariant =
  | 'primary'
  | 'secondary'
  | 'sos'
  | 'emergency'
  | 'danger'
  | 'outline'
  | 'ghost';

export type ApprovedButtonSize = 'sm' | 'md' | 'lg';

export interface ApprovedButtonProps {
  variant?: ApprovedButtonVariant;
  size?: ApprovedButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  children: ReactNode | string;
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const ApprovedButton: React.FC<ApprovedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  children,
  onPress,
  onLongPress,
  delayLongPress,
  testID,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const isActionDisabled = disabled || isLoading;

  const containerStyle = [
    styles.base,
    fullWidth ? styles.fullWidth : styles.autoWidth,
    sizeContainerStyles[size],
    variantContainerStyles[variant],
    isActionDisabled && styles.disabledContainer,
    style,
  ];

  const labelStyle = [
    styles.baseText,
    sizeTextStyles[size],
    variantTextStyles[variant],
    isActionDisabled && styles.disabledText,
    textStyle,
  ];

  const spinnerColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'sos' || variant === 'emergency'
      ? '#DC2626'
      : '#1565C0';

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={
        accessibilityLabel || (typeof children === 'string' ? children : 'Botão')
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: isActionDisabled, busy: isLoading }}
      delayLongPress={delayLongPress}
      disabled={isActionDisabled}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        containerStyle,
        pressed && !isActionDisabled && styles.pressed,
      ]}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          {typeof children === 'string' ? (
            <Text style={labelStyle}>{children}</Text>
          ) : (
            children
          )}
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  autoWidth: {
    alignSelf: 'flex-start',
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
});

const sizeContainerStyles = StyleSheet.create({
  sm: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  md: {
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
});

const sizeTextStyles = StyleSheet.create({
  sm: {
    fontSize: 12,
    lineHeight: 16,
  },
  md: {
    fontSize: 14,
    lineHeight: 20,
  },
  lg: {
    fontSize: 16,
    lineHeight: 22,
  },
});

const variantContainerStyles = StyleSheet.create({
  primary: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  secondary: {
    backgroundColor: '#E3F2FD',
    borderColor: '#E3F2FD',
  },
  sos: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(220, 38, 38, 0.4)',
    borderWidth: 1.5,
  },
  emergency: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  danger: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

const variantTextStyles = StyleSheet.create({
  primary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondary: {
    color: '#1565C0',
    fontWeight: '700',
  },
  sos: {
    color: '#DC2626',
    fontWeight: '800',
  },
  emergency: {
    color: '#DC2626',
    fontWeight: '800',
  },
  danger: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  outline: {
    color: '#334155',
    fontWeight: '600',
  },
  ghost: {
    color: '#64748B',
    fontWeight: '600',
  },
});
