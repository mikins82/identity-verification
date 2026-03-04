import { View, Text, StyleSheet } from "react-native";
import type { VerificationStep } from "@identity-verification/headless";
import { useTheme, useNumericSpacing } from "../../theme/useTheme";

interface StepDef {
  key: VerificationStep;
  label: string;
  number: number;
}

const STEPS: StepDef[] = [
  { key: "selfie", label: "Selfie", number: 1 },
  { key: "phone", label: "Phone", number: 2 },
  { key: "address", label: "Address", number: 3 },
];

export interface StepIndicatorProps {
  currentStep: VerificationStep | "verifying" | "complete" | "failed";
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const theme = useTheme();
  const spacing = useNumericSpacing();
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : STEPS.length;

  return (
    <View
      style={[styles.container, { paddingVertical: spacing.md }]}
      accessibilityRole="header"
      accessibilityLabel="Verification progress"
    >
      <View style={styles.steps}>
        {STEPS.map((step, i) => {
          const completed = i < effectiveIndex;
          const active = i === currentIndex;

          return (
            <View key={step.key} style={styles.stepItem}>
              {i > 0 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: completed
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                />
              )}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: active
                      ? theme.colors.primary
                      : completed
                        ? theme.colors.primary
                        : theme.colors.surface,
                    borderColor: active
                      ? theme.colors.primary
                      : completed
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                accessibilityLabel={`Step ${step.number}: ${step.label}${active ? ", current" : completed ? ", completed" : ""}`}
              >
                {completed ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.number,
                      {
                        color: active || completed
                          ? "#ffffff"
                          : theme.colors.textSecondary,
                        fontFamily: theme.fontFamily,
                      },
                    ]}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: active
                      ? theme.colors.text
                      : completed
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    fontFamily: theme.fontFamily,
                  },
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  connector: {
    width: 32,
    height: 2,
    marginHorizontal: 4,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  number: {
    fontSize: 13,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
});
