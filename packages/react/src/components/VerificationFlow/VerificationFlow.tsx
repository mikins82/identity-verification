import { useCallback, useEffect, useRef } from "react";
import {
  getIdentityData,
  VerificationError,
  type IdentityData,
  type VerificationOptions,
  type Address,
} from "@identity-verification/core";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import { SelfieCapture } from "../SelfieCapture";
import { PhoneInput } from "../PhoneInput";
import { AddressForm } from "../AddressForm";
import { StepIndicator } from "./StepIndicator";
import {
  useVerificationReducer,
  type VerificationStep,
} from "./useVerificationReducer";
import styles from "./VerificationFlow.module.css";

export interface VerificationFlowProps {
  onComplete: (result: IdentityData) => void;
  onResult?: (result: IdentityData) => void;
  onStepChange?: (step: VerificationStep) => void;
  onError?: (error: VerificationError | Error) => void;
  verificationOptions?: VerificationOptions;
  className?: string;
}

const STEP_LABELS: Record<string, string> = {
  selfie: "Take a selfie for identity verification",
  phone: "Enter your phone number",
  address: "Enter your address",
};

export function VerificationFlow({
  onComplete,
  onResult,
  onStepChange,
  onError,
  verificationOptions,
  className,
}: VerificationFlowProps) {
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

  const stableOnComplete = useCallbackRef(onComplete);
  const stableOnResult = useCallbackRef(onResult ?? (() => {}));
  const stableOnError = useCallbackRef(onError ?? (() => {}));
  const stableOnStepChange = useCallbackRef(onStepChange ?? (() => {}));

  const selfieRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const panelRefs = [selfieRef, phoneRef, addressRef];

  useEffect(() => {
    if (
      state.step === "selfie" ||
      state.step === "phone" ||
      state.step === "address"
    ) {
      stableOnStepChange(state.step);
    }
  }, [state.step, stableOnStepChange]);

  useEffect(() => {
    if (state.step !== "selfie" && state.step !== "phone" && state.step !== "address") return;
    const idx = ["selfie", "phone", "address"].indexOf(state.step);
    const panelEl = panelRefs[idx]?.current;
    if (!panelEl) return;

    const timer = setTimeout(() => {
      const focusable = panelEl.querySelector<HTMLElement>(
        'input:not([type="hidden"]), button:not(:disabled), [tabindex]:not([tabindex="-1"]), video',
      );
      focusable?.focus();
    }, 350);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

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

      if (onResult) {
        stableOnComplete(result);
        stableOnResult(result);
      } else if (result.status === "verified") {
        verifySuccess(result);
        stableOnComplete(result);
      } else {
        verifyFailure(result);
      }
    } catch (err) {
      const failedResult: IdentityData = {
        selfieUrl: state.selfie,
        phone: state.phone,
        address: state.address as Address,
        score: 0,
        status: "failed",
      };
      if (onResult) {
        stableOnResult(failedResult);
      } else {
        verifyFailure(failedResult);
      }
      stableOnError(err as Error);
    }
  }, [
    state.selfie,
    state.phone,
    state.countryCode,
    state.address,
    onResult,
    startVerify,
    verifySuccess,
    verifyFailure,
    verificationOptions,
    stableOnComplete,
    stableOnResult,
    stableOnError,
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

  const translateX =
    stepIndex >= 0 ? `translateX(-${stepIndex * 100}%)` : "translateX(-200%)";

  if (state.step === "verifying") {
    return (
      <div className={`${styles.container} ${className ?? ""}`}>
        <StepIndicator currentStep="verifying" />
        <div className={styles.verifying} role="status" aria-live="polite">
          <div className={styles.spinner} />
          <p className={styles.verifyingText}>Verifying your identity…</p>
        </div>
      </div>
    );
  }

  if (state.step === "complete") {
    return (
      <div className={`${styles.container} ${className ?? ""}`}>
        <div className={styles.result} role="status">
          <div className={styles.successIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
              <path
                d="M7 12.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className={styles.resultTitle}>Verification Complete</p>
          <p className={styles.resultScore}>
            Score: {state.result?.score}
          </p>
        </div>
      </div>
    );
  }

  if (state.step === "failed") {
    return (
      <div className={`${styles.container} ${className ?? ""}`}>
        <div className={styles.result} role="alert">
          <div className={styles.failIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 8l8 8M16 8l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className={styles.resultTitle}>Verification Failed</p>
          <p className={styles.resultScore}>
            Score: {state.result?.score}
          </p>
          <button type="button" className={styles.retryButton} onClick={retry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <StepIndicator currentStep={state.step as VerificationStep} />

      <div className={styles.viewport} aria-label={STEP_LABELS[state.step]}>
        <div className={styles.track} style={{ transform: translateX }}>
          <div
            ref={selfieRef}
            className={styles.panel}
            role="tabpanel"
            aria-hidden={state.step !== "selfie"}
            id="iv-step-selfie"
          >
            {state.selfie ? (
              <div className={styles.selfiePreview}>
                <img
                  src={state.selfie}
                  alt="Captured selfie"
                  className={styles.selfieImage}
                />
                <button
                  type="button"
                  className={styles.retakeLink}
                  onClick={() => captureSelfie("")}
                >
                  Retake photo
                </button>
              </div>
            ) : (
              <SelfieCapture onCapture={captureSelfie} />
            )}
          </div>

          <div
            ref={phoneRef}
            className={styles.panel}
            role="tabpanel"
            aria-hidden={state.step !== "phone"}
            id="iv-step-phone"
          >
            <PhoneInput
              onChange={handlePhoneChange}
              defaultCountry={state.countryCode ?? "US"}
            />
          </div>

          <div
            ref={addressRef}
            className={styles.panel}
            role="tabpanel"
            aria-hidden={state.step !== "address"}
            id="iv-step-address"
          >
            <AddressForm
              onChange={handleAddressChange}
              defaultCountry={state.countryCode ?? "US"}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={prevStep}
          disabled={stepIndex <= 0}
        >
          Back
        </button>
        <button
          type="button"
          className={styles.nextButton}
          onClick={handleNext}
          disabled={!canAdvance}
        >
          {state.step === "address" ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
