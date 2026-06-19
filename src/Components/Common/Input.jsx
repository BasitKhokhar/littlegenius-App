import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../Context/ThemeContext';
import { Typography, Spacing, Radius, textStyles } from '../../Theme';

// ──────────────────────────────────────────────────────────────
// Input — elegant, token-driven text field with a soft focus ring,
// optional leading icon, password toggle, helper + error text.
// ──────────────────────────────────────────────────────────────
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  helper,
  icon,
  style,
  inputStyle,
  ...rest
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {!!label && (
        <Text style={[textStyles.caption, styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor,
          },
          isFocused && { borderWidth: 2 },
        ]}
      >
        {!!icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
            <Text style={[styles.toggle, { color: colors.primary }]}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {!!error ? (
        <Text style={[styles.helper, { color: colors.error }]}>{error}</Text>
      ) : helper ? (
        <Text style={[styles.helper, { color: colors.textMuted }]}>{helper}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg },
  label: { marginBottom: Spacing.sm, marginLeft: Spacing.xs },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
    gap: Spacing.sm,
  },
  icon: { fontSize: 17 },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.md,
    fontFamily: Typography.font.medium,
  },
  toggle: {
    fontFamily: Typography.font.bold,
    fontSize: Typography.size.sm,
  },
  helper: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
    fontSize: Typography.size.xs,
    fontFamily: Typography.font.medium,
  },
});

export default Input;
