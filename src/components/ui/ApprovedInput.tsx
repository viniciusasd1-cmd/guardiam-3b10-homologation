import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState, type ReactNode } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export interface ApprovedInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
}

export const ApprovedInput: React.FC<ApprovedInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#94A3B8',
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  editable = true,
  testID,
  style,
  inputStyle,
  onSubmitEditing,
  returnKeyType,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

        <TextInput
          accessibilityLabel={label || placeholder}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          keyboardType={keyboardType}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          returnKeyType={returnKeyType}
          secureTextEntry={isPassword && !showPassword}
          style={[
            styles.textInput,
            leftIcon ? styles.inputWithLeftIcon : null,
            isPassword ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          value={value}
        />

        {isPassword ? (
          <Pressable
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            accessibilityRole="button"
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={18} color="#94A3B8" />
            ) : (
              <Eye size={18} color="#94A3B8" />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: '#1565C0',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  leftIconContainer: {
    marginRight: 10,
  },
  textInput: {
    color: '#0F172A',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
    padding: 0,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 10,
  },
  eyeButton: {
    padding: 6,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  helperText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
});
