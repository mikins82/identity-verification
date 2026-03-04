import { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  getIdentityData,
  VerificationError,
  type IdentityData,
  type VerificationOptions,
  type Address,
} from "@identity-verification/core";
import { SelfieCapture } from "../SelfieCapture";
import { PhoneInput } from "../PhoneInput";
import { AddressForm } from "../AddressForm";
import { StepIndicator } from "./StepIndicator";
import {
  useVerificationReducer,
  type VerificationStep,
} from "./useVerificationReducer";
import { useTheme, useNumericSpacing, useBorderRadius } from "../../theme/useTheme";

export interface VerificationFlowProps {
  onComplete: (result: IdentityData) => void;
  onStepChange?: (step: VerificationStep) => void;
  onError?: (error: VerificationError | Error) => void;
  verificationOptions?: VerificationOptions;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export function VerificationFlow({
  onComplete,
  onStepChange,
  onError,
  verificationOptions,
}: VerificationFlowProps) {
  const theme = useTheme();
  const spacing = useNumericSpacing();
  const borderRadius = useBorderRadius();
  const scrollRef = useRef<ScrollView>(null);

  const {
    state,
    canAdvance,
    stepIndex,
    captureSelfie,
    setPhone,
    setAddress,
    nextStep,
    prevStep,
    startVerify,
    verifySuccess,
    verifyFailure,
    retry,
  } = useVerificationReducer();

  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const onStepChangeRef = useRef(onStepChange);
  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;
  onStepChangeRef.current = onStepChange;

  useEffect(() => {
    if (
      state.step === "selfie" ||
      state.step === "phone" ||
      state.step === "address"
    ) {
      onStepChangeRef.current?.(state.step);
    }
  }, [state.step]);

  useEffect(() => {
    if (stepIndex >= 0) {
      scrollRef.current?.scrollTo({ x: stepIndex * SCREEN_WIDTH, animated: true });
    }
  }, [stepIndex]);

  const handleSubmit = useCallback(async () => {
    if (!state.selfie || !state.phone || !state.countryCode) return;
    startVerify();

    try {
      const result = await getIdentityData(
        {
          selfie: state.selfie,
          phone: state.phone,
          countryCode: state.countryCode,
          address: state.address as Address,
        },
        verificationOptions,
      );

      if (result.status === "verified") {
        verifySuccess(result);
        onCompleteRef.current(result);
      } else {
        verifyFailure(result);
      }
    } catch (err) {
      verifyFailure({
        selfieUrl: state.selfie,
        phone: state.phone,
        address: state.address as Address,
        score: 0,
        status: "failed",
      });
      onErrorRef.current?.(err as Error);
    }
  }, [
    state.selfie,
    state.phone,
    state.countryCode,
    state.address,
    startVerify,
    verifySuccess,
    verifyFailure,
    verificationOptions,
  ]);

  const handleNext = useCallback(() => {
    if (state.step === "address") {
      handleSubmit();
    } else {
      nextStep();
    }
  }, [state.step, nextStep, handleSubmit]);

  const handlePhoneChange = useCallback(
    (phone: string, countryCode: string) => setPhone(phone, countryCode),
    [setPhone],
  );

  const handleAddressChange = useCallback(
    (address: Address) => setAddress(address),
    [setAddress],
  );

  if (state.step === "verifying") {
    return (
      <View style={[styles.container, { padding: spacing.lg }]}>
        <StepIndicator currentStep="verifying" />
        <View style={[styles.center, { marginTop: spacing.xl }]} accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.statusText,
              { color: theme.colors.text, fontFamily: theme.fontFamily, marginTop: spacing.md },
            ]}
          >
            Verifying your identity…
          </Text>
        </View>
      </View>
    );
  }

  if (state.step === "complete") {
    return (
      <View style={[styles.container, { padding: spacing.lg }]}>
        <View style={[styles.center, { marginTop: spacing.xl }]}>
          <View
            style={[
              styles.iconCircle,
              { borderColor: theme.colors.success, backgroundColor: theme.colors.successLight },
            ]}
          >
            <Text style={{ color: theme.colors.success, fontSize: 28 }}>✓</Text>
          </View>
          <Text
            style={[
              styles.resultTitle,
              { color: theme.colors.text, fontFamily: theme.fontFamily, marginTop: spacing.md },
            ]}
          >
            Verification Complete
          </Text>
          <Text
            style={[
              styles.resultScore,
              { color: theme.colors.textSecondary, fontFamily: theme.fontFamily, marginTop: spacing.sm },
            ]}
          >
            Score: {state.result?.score}
          </Text>
        </View>
      </View>
    );
  }

  if (state.step === "failed") {
    return (
      <View style={[styles.container, { padding: spacing.lg }]}>
        <View style={[styles.center, { marginTop: spacing.xl }]} accessibilityRole="alert">
          <View
            style={[
              styles.iconCircle,
              { borderColor: theme.colors.error, backgroundColor: theme.colors.errorLight },
            ]}
          >
            <Text style={{ color: theme.colors.error, fontSize: 28 }}>✕</Text>
          </View>
          <Text
            style={[
              styles.resultTitle,
              { color: theme.colors.text, fontFamily: theme.fontFamily, marginTop: spacing.md },
            ]}
          >
            Verification Failed
          </Text>
          <Text
            style={[
              styles.resultScore,
              { color: theme.colors.textSecondary, fontFamily: theme.fontFamily, marginTop: spacing.sm },
            ]}
          >
            Score: {state.result?.score}
          </Text>
          <Pressable
            onPress={retry}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius,
                marginTop: spacing.lg,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
              },
            ]}
            accessibilityRole="button"
          >
            <Text style={{ color: "#ffffff", fontFamily: theme.fontFamily, fontWeight: "600" }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingVertical: spacing.md }]}>
      <StepIndicator currentStep={state.step as VerificationStep} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.viewport}
      >
        <View style={[styles.panel, { width: SCREEN_WIDTH, padding: spacing.md }]}>
          {state.selfie ? (
            <View style={styles.center}>
              <Image
                source={{ uri: state.selfie }}
                style={[styles.selfiePreview, { borderRadius }]}
                accessibilityLabel="Captured selfie"
              />
              <Pressable
                onPress={() => captureSelfie("")}
                style={{ marginTop: spacing.sm }}
                accessibilityRole="button"
              >
                <Text style={{ color: theme.colors.primary, fontFamily: theme.fontFamily }}>
                  Retake photo
                </Text>
              </Pressable>
            </View>
          ) : (
            <SelfieCapture onCapture={captureSelfie} />
          )}
        </View>

        <View style={[styles.panel, { width: SCREEN_WIDTH, padding: spacing.md }]}>
          <PhoneInput
            onChange={handlePhoneChange}
            defaultCountry={state.countryCode ?? "US"}
          />
        </View>

        <View style={[styles.panel, { width: SCREEN_WIDTH, padding: spacing.md }]}>
          <AddressForm
            onChange={handleAddressChange}
            defaultCountry={state.countryCode ?? "US"}
          />
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm }]}>
        <Pressable
          onPress={prevStep}
          disabled={stepIndex <= 0}
          style={[
            styles.secondaryButton,
            {
              borderColor: theme.colors.border,
              borderRadius,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              opacity: stepIndex <= 0 ? 0.4 : 1,
            },
          ]}
          accessibilityRole="button"
        >
          <Text style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={handleNext}
          disabled={!canAdvance}
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.colors.primary,
              borderRadius,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              opacity: canAdvance ? 1 : 0.5,
            },
          ]}
          accessibilityRole="button"
        >
          <Text style={{ color: "#ffffff", fontFamily: theme.fontFamily, fontWeight: "600" }}>
            {state.step === "address" ? "Submit" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 16,
    textAlign: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  resultScore: {
    fontSize: 14,
    textAlign: "center",
  },
  viewport: {
    flex: 1,
  },
  panel: {
    flex: 1,
  },
  selfiePreview: {
    width: "80%",
    aspectRatio: 3 / 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryButton: {
    borderWidth: 1,
    alignItems: "center",
  },
  primaryButton: {
    alignItems: "center",
  },
});
