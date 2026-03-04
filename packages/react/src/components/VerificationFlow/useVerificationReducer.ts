import { useReducer, useCallback } from "react";
import type { Address, IdentityData } from "@identity-verification/core";
import {
  verificationReducer,
  initialVerificationState,
  canAdvance,
  STEP_ORDER,
  type VerificationState,
  type VerificationAction,
  type VerificationStep,
} from "@identity-verification/headless";

export type { VerificationStep, VerificationState, VerificationAction };

export function useVerificationReducer() {
  const [state, dispatch] = useReducer(verificationReducer, initialVerificationState);

  const canAdvanceNow = canAdvance(state.step, state);
  const stepIndex = STEP_ORDER.indexOf(state.step as VerificationStep);

  const captureSelfie = useCallback(
    (base64: string) => dispatch({ type: "CAPTURE_SELFIE", payload: base64 }),
    [],
  );

  const setPhone = useCallback(
    (phone: string, countryCode: string) =>
      dispatch({ type: "SET_PHONE", payload: { phone, countryCode } }),
    [],
  );

  const setAddress = useCallback(
    (address: Address) => dispatch({ type: "SET_ADDRESS", payload: address }),
    [],
  );

  const nextStep = useCallback(() => dispatch({ type: "NEXT_STEP" }), []);
  const prevStep = useCallback(() => dispatch({ type: "PREV_STEP" }), []);
  const startVerify = useCallback(() => dispatch({ type: "VERIFY_START" }), []);

  const verifySuccess = useCallback(
    (data: IdentityData) => dispatch({ type: "VERIFY_SUCCESS", payload: data }),
    [],
  );

  const verifyFailure = useCallback(
    (data: IdentityData) => dispatch({ type: "VERIFY_FAILURE", payload: data }),
    [],
  );

  const retry = useCallback(() => dispatch({ type: "RETRY" }), []);

  return {
    state,
    canAdvance: canAdvanceNow,
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
  };
}
