import type { Address, IdentityData } from "@identity-verification/core";
import { validatePhone, validateAddress } from "@identity-verification/core";

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

export const STEP_ORDER: VerificationStep[] = ["selfie", "phone", "address"];

export const initialVerificationState: VerificationState = {
  step: "selfie",
  selfie: null,
  phone: null,
  countryCode: null,
  address: {},
  result: null,
};

export function canAdvance(
  step: VerificationState["step"],
  state: VerificationState,
): boolean {
  switch (step) {
    case "selfie":
      return state.selfie !== null;
    case "phone":
      return (
        state.phone !== null &&
        state.countryCode !== null &&
        validatePhone(state.phone, state.countryCode).valid
      );
    case "address":
      return validateAddress(state.address, state.address.country).valid;
    default:
      return false;
  }
}

export function verificationReducer(
  state: VerificationState,
  action: VerificationAction,
): VerificationState {
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
      if (!canAdvance(state.step, state)) return state;
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
      return { ...initialVerificationState };

    default:
      return state;
  }
}
