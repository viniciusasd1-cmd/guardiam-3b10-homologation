import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  type StyleProp,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { GText } from './GText';
import { guardiamV2Radius, type GuardiamV2Theme } from '../../theme/guardiamV2';

export type GButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type GButtonProps = Omit<TouchableOpacityProps, 'children' | 'style'> & {
  title: string;
  theme: GuardiamV2Theme;
  variant?: GButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GButton({
  title,
  theme,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  ...props
}: GButtonProps) {
  let backgroundColor = theme.brand;
  let textColor = theme.background;
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    backgroundColor = 'transparent';
    textColor = theme.text;
    borderColor = theme.borderStrong;
    borderWidth = 1;
  } else if (variant === 'danger') {
    backgroundColor = theme.sos;
    textColor = '#FFFFFF';
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = theme.text2;
  }

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius: guardiamV2Radius.md,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.6 : 1,
          flexDirection: 'row',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <GText style={{ color: textColor, fontWeight: '600', fontSize: 16 }} theme={theme}>
          {title}
        </GText>
      )}
    </TouchableOpacity>
  );
}