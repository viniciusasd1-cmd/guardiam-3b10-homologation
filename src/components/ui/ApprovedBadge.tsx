import React, { type ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export type ApprovedBadgeVariant =
  | 'inactive'
  | 'active'
  | 'sos'
  | 'neutral'
  | 'pro'
  | 'primary';

export interface ApprovedBadgeProps {
  variant?: ApprovedBadgeVariant;
  children: ReactNode | string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const ApprovedBadge: React.FC<ApprovedBadgeProps> = ({
  variant = 'inactive',
  children,
  testID,
  style,
  textStyle,
}) => {
  return (
    <View
      style={[
        styles.base,
        variantContainerStyles[variant],
        style,
      ]}
      testID={testID}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.baseText,
            variantTextStyles[variant],
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  baseText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const variantContainerStyles = StyleSheet.create({
  inactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  active: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sos: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  neutral: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  pro: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  primary: {
    backgroundColor: '#E3F2FD',
    borderColor: 'rgba(21, 101, 192, 0.3)',
  },
});

const variantTextStyles = StyleSheet.create({
  inactive: {
    color: '#475569',
  },
  active: {
    color: '#10B981',
  },
  sos: {
    color: '#DC2626',
  },
  neutral: {
    color: '#475569',
  },
  pro: {
    color: '#D97706',
    fontWeight: '700',
  },
  primary: {
    color: '#1565C0',
    fontWeight: '700',
  },
});
