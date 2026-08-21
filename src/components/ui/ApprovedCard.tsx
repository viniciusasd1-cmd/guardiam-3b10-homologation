import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export type ApprovedCardVariant = 'default' | 'flat' | 'dark' | 'interactive';

export interface ApprovedCardProps {
  variant?: ApprovedCardVariant;
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export const ApprovedCard: React.FC<ApprovedCardProps> = ({
  variant = 'default',
  children,
  onPress,
  style,
  testID,
  accessibilityLabel,
}) => {
  const cardStyle = [
    styles.base,
    variantStyles[variant],
    style,
  ];

  if (variant === 'interactive' || onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  flat: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  dark: {
    backgroundColor: '#101C42',
    borderColor: 'rgba(30, 58, 138, 0.4)',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  interactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
});
