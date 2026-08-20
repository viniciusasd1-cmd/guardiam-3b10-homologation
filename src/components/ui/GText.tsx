import React from 'react';
import { Text, type TextProps, type TextStyle, type StyleProp } from 'react-native';
import {
  getGuardiamV2Theme,
  guardiamV2Typography,
  type GuardiamV2Theme,
  type GuardiamV2ThemeMode,
} from '../../theme/guardiamV2';

export type GTextVariant = 'body' | 'display';

export type GTextProps = Omit<TextProps, 'style'> & {
  variant?: GTextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
  theme?: GuardiamV2Theme;
  themeMode?: GuardiamV2ThemeMode;
};

export function GText({
  variant = 'body',
  color,
  style,
  theme,
  themeMode = 'light',
  children,
  ...props
}: GTextProps) {
  const resolvedTheme = theme ?? getGuardiamV2Theme(themeMode);
  const isDisplay = variant === 'display';
  const typography = isDisplay ? guardiamV2Typography.title : guardiamV2Typography.body;

  return (
    <Text
      {...props}
      style={[
        {
          color: color ?? resolvedTheme.text,
          fontFamily: isDisplay
            ? guardiamV2Typography.displayFontFamily
            : guardiamV2Typography.bodyFontFamily,
          fontSize: typography.fontSize,
          fontWeight: typography.fontWeight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}