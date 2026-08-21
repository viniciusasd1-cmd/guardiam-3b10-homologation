import { User } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export type ApprovedAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ApprovedAvatarProps {
  size?: ApprovedAvatarSize;
  src?: string;
  name?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const DIMENSION_MAP = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

const FONT_MAP = {
  sm: 11,
  md: 14,
  lg: 20,
  xl: 30,
};

const ICON_MAP = {
  sm: 16,
  md: 22,
  lg: 32,
  xl: 48,
};

export const ApprovedAvatar: React.FC<ApprovedAvatarProps> = ({
  size = 'md',
  src,
  name,
  style,
  testID,
}) => {
  const dimension = DIMENSION_MAP[size] || 44;
  const fontSize = FONT_MAP[size] || 14;
  const iconSize = ICON_MAP[size] || 22;

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : null;

  return (
    <View
      style={[
        styles.container,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        style,
      ]}
      testID={testID}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
        />
      ) : initials ? (
        <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
      ) : (
        <User size={iconSize} color="#64748B" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsText: {
    color: '#1E293B',
    fontWeight: '700',
  },
});
