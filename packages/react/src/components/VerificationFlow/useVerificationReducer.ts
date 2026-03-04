import { useReducer, useCallback } from "react";
import type { Address, IdentityData } from "@identity-verification/core";

export type VerificationStep = "selfie" | "phone" | "address" | "verifying";

export interface VerificationState {
  step: VerificationStep | "complete" | "failed";
  selfie: string | null;
  phone: string | null;
  countryCode: string | null;
  address: Partial<Address>;
  result: IdentityData | null;
}

export type VerificationAction =
  | { type: "CAPTURE_SELFIE"; payload: string }
  | { type: "SET_PHONE"; payload: { phone: string; countryCode: string } }
  | { type: "SET_ADDRESS"; payload: Address }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "VERIFY_START" }
  | { type: "VERIFY_SUCCESS"; payload: IdentityData }
  | { type: "VERIFY_FAILURE"; payload: IdentityData }
  | { type: "RETRY" };

const STEP_ORDER: VerificationStep[] = ["selfie", "phone", "address"];

function getInitialState(): VerificationState {
  return {
    step: "selfie",
    selfie: null,
    phone: null,
    countryCode: null,
    address: {},
    result: null,
  };
}

function canAdvanceFrom(state: VerificationState): boolean {
  switch (state.step) {
    case "selfie":
      return state.selfie !== null;
    case "phone":
      return state.phone !== null && state.phone.length >= 7;
    case "address": {
      const a = state.address;
      return Boolean(
        a.street?.trim() &&
          a.city?.trim() &&
          a.state?.trim() &&
          a.country?.trim() &&
          a.postalCode?.trim(),
      );
    }
    default:
      return false;
  }
}

function reducer(state: VerificationState, action: VerificationAction): VerificationState {
  switch (action.type) {
    case "CAPTURE_SELFIE":
      return { ...state, selfie: action.payload };

    case "SET_PHONE":
      return {
        ...state,
        phone: action.payload.phone,
        countryCode: action.payload.countryCode,
      };

    case "SET_ADDRESS":
      return { ...state, address: action.payload };

    case "NEXT_STEP": {
      if (!canAdvanceFrom(state)) return state;
      const idx = STEP_ORDER.indexOf(state.step as VerificationStep);
      if (idx < 0 || idx >= STEP_ORDER.length - 1) return state;
      return { ...state, step: STEP_ORDER[idx + 1] };
    }

    case "PREV_STEP": {
      const idx = STEP_ORDER.indexOf(state.step as VerificationStep);
      if (idx <= 0) return state;
      return { ...state, step: STEP_ORDER[idx - 1] };
    }

    case "VERIFY_START":
      return { ...state, step: "verifying" };

    case "VERIFY_SUCCESS":
      return { ...state, step: "complete", result: action.payload };

    case "VERIFY_FAILURE":
      return { ...state, step: "failed", result: action.payload };

    case "RETRY":
      return getInitialState();

    default:
      return state;
  }
}

export function useVerificationReducer() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  const canAdvance = canAdvanceFrom(state);
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
  };
}
