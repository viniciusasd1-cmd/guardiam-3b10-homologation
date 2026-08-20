import React, { type ComponentType } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import {
  TouchableOpacity,
  View,
  type StyleProp,
  type TouchableOpacityProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { GText } from './GText';
import { guardiamV2Spacing, type GuardiamV2Theme } from '../../theme/guardiamV2';

type HeaderIconProps = {
  size?: number;
  color?: string;
};

export type GHeaderProps = Omit<ViewProps, 'style'> & {
  title?: string;
  onBack?: TouchableOpacityProps['onPress'];
  rightIcon?: ComponentType<HeaderIconProps>;
  onRightPress?: TouchableOpacityProps['onPress'];
  theme: GuardiamV2Theme;
  style?: StyleProp<ViewStyle>;
};

export function GHeader({
  title,
  onBack,
  rightIcon: RightIcon,
  onRightPress,
  theme,
  style,
  ...props
}: GHeaderProps) {
  return (
    <View
      {...props}
      style={[
        {
          height: 64,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: guardiamV2Spacing.md,
          backgroundColor: theme.background,
        },
        style,
      ]}
    >
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={{ padding: guardiamV2Spacing.sm }}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
      {title ? (
        <GText variant="display" theme={theme} style={{ fontSize: 18 }}>
          {title}
        </GText>
      ) : null}
      {RightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={{ padding: guardiamV2Spacing.sm }}>
          <RightIcon size={24} color={theme.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}