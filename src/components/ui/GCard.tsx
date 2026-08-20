import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { guardiamV2Radius, guardiamV2Spacing, type GuardiamV2Theme } from '../../theme/guardiamV2';

export type GCardProps = Omit<ViewProps, 'style'> & {
  theme: GuardiamV2Theme;
  style?: StyleProp<ViewStyle>;
};

export function GCard({ theme, style, children, ...props }: GCardProps) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: guardiamV2Radius.lg,
          borderWidth: 1,
          borderColor: theme.border,
          padding: guardiamV2Spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}