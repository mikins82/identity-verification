import { type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, useNumericSpacing } from "../../../theme/useTheme";

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  const theme = useTheme();
  const spacing = useNumericSpacing();

  return (
    <View style={[styles.field, { marginBottom: spacing.md }]}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text,
            fontFamily: theme.fontFamily,
            marginBottom: spacing.xs,
          },
        ]}
      >
        {label}
        {required && (
          <Text style={{ color: theme.colors.error }}> *</Text>
        )}
      </Text>
      {children}
      {error && (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.error,
              fontFamily: theme.fontFamily,
              marginTop: spacing.xs,
            },
          ]}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text
          style={[
            styles.hint,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fontFamily,
              marginTop: spacing.xs,
            },
          ]}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
  },
});
