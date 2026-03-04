import { describe, it, expect } from "vitest";
import {
  verificationReducer,
  initialVerificationState,
  canAdvance,
  STEP_ORDER,
  type VerificationState,
} from "../src/verificationMachine";
import type { Address } from "@identity-verification/core";

const validAddress: Address = {
  street: "123 Main St",
  city: "San Francisco",
  state: "CA",
  country: "US",
  postalCode: "94102",
};

function buildState(overrides: Partial<VerificationState> = {}): VerificationState {
  return { ...initialVerificationState, ...overrides };
}

describe("initialVerificationState", () => {
  it("starts on the selfie step with all fields empty", () => {
    expect(initialVerificationState).toEqual({
      step: "selfie",
      selfie: null,
      phone: null,
      countryCode: null,
      address: {},
      result: null,
    });
  });
});

describe("STEP_ORDER", () => {
  it("defines the ordered user-facing steps", () => {
    expect(STEP_ORDER).toEqual(["selfie", "phone", "address"]);
  });
});

describe("canAdvance", () => {
  describe("selfie step", () => {
    it("returns false when selfie is null", () => {
      expect(canAdvance("selfie", buildState())).toBe(false);
    });

    it("returns true when selfie is captured", () => {
      expect(canAdvance("selfie", buildState({ selfie: "data:image/jpeg;base64,abc" }))).toBe(true);
    });
  });

  describe("phone step", () => {
    it("returns false when phone is null", () => {
      expect(canAdvance("phone", buildState())).toBe(false);
    });

    it("returns false when countryCode is null", () => {
      expect(canAdvance("phone", buildState({ phone: "4155552671" }))).toBe(false);
    });

    it("returns false when phone is too short for the country", () => {
      expect(canAdvance("phone", buildState({ phone: "123", countryCode: "US" }))).toBe(false);
    });

    it("returns false when phone does not match country length", () => {
      expect(canAdvance("phone", buildState({ phone: "1234567", countryCode: "US" }))).toBe(false);
    });

    it("returns true when phone matches country-specific length", () => {
      expect(canAdvance("phone", buildState({ phone: "4155552671", countryCode: "US" }))).toBe(true);
    });

    it("returns true for a phone within a valid range", () => {
      expect(canAdvance("phone", buildState({ phone: "7911123456", countryCode: "GB" }))).toBe(true);
    });
  });

  describe("address step", () => {
    it("returns false when address is empty", () => {
      expect(canAdvance("address", buildState())).toBe(false);
    });

    it("returns false when address is partially filled", () => {
      expect(
        canAdvance("address", buildState({ address: { street: "123 Main", city: "SF" } })),
      ).toBe(false);
    });

    it("returns false when any field is whitespace-only", () => {
      expect(
        canAdvance(
          "address",
          buildState({
            address: { ...validAddress, postalCode: "   " },
          }),
        ),
      ).toBe(false);
    });

    it("returns true when all required fields are present", () => {
      expect(canAdvance("address", buildState({ address: validAddress }))).toBe(true);
    });
  });

  describe("non-advanceable steps", () => {
    it("returns false for verifying", () => {
      expect(canAdvance("verifying", buildState())).toBe(false);
    });

    it("returns false for complete", () => {
      expect(canAdvance("complete", buildState())).toBe(false);
    });

    it("returns false for failed", () => {
      expect(canAdvance("failed", buildState())).toBe(false);
    });
  });
});

describe("verificationReducer", () => {
  describe("CAPTURE_SELFIE", () => {
    it("stores the selfie image data", () => {
      const state = verificationReducer(initialVerificationState, {
        type: "CAPTURE_SELFIE",
        payload: "data:image/jpeg;base64,abc123",
      });
      expect(state.selfie).toBe("data:image/jpeg;base64,abc123");
    });

    it("preserves other state fields", () => {
      const state = verificationReducer(
        buildState({ phone: "1234567890", countryCode: "US" }),
        { type: "CAPTURE_SELFIE", payload: "selfie-data" },
      );
      expect(state.phone).toBe("1234567890");
      expect(state.countryCode).toBe("US");
    });
  });

  describe("SET_PHONE", () => {
    it("stores phone and country code", () => {
      const state = verificationReducer(initialVerificationState, {
        type: "SET_PHONE",
        payload: { phone: "4155552671", countryCode: "US" },
      });
      expect(state.phone).toBe("4155552671");
      expect(state.countryCode).toBe("US");
    });
  });

  describe("SET_ADDRESS", () => {
    it("stores the address", () => {
      const state = verificationReducer(initialVerificationState, {
        type: "SET_ADDRESS",
        payload: validAddress,
      });
      expect(state.address).toEqual(validAddress);
    });
  });

  describe("NEXT_STEP", () => {
    it("does not advance when canAdvance is false", () => {
      const state = verificationReducer(initialVerificationState, { type: "NEXT_STEP" });
      expect(state.step).toBe("selfie");
      expect(state).toBe(initialVerificationState);
    });

    it("advances from selfie to phone when selfie is captured", () => {
      const state = verificationReducer(buildState({ selfie: "data" }), { type: "NEXT_STEP" });
      expect(state.step).toBe("phone");
    });

    it("advances from phone to address when phone is valid", () => {
      const state = verificationReducer(
        buildState({ step: "phone", selfie: "data", phone: "4155552671", countryCode: "US" }),
        { type: "NEXT_STEP" },
      );
      expect(state.step).toBe("address");
    });

    it("does not advance past the last step", () => {
      const state = verificationReducer(
        buildState({ step: "address", address: validAddress }),
        { type: "NEXT_STEP" },
      );
      expect(state.step).toBe("address");
    });

    it("does not advance from non-flow steps", () => {
      const state = verificationReducer(
        buildState({ step: "verifying" }),
        { type: "NEXT_STEP" },
      );
      expect(state.step).toBe("verifying");
    });
  });

  describe("PREV_STEP", () => {
    it("does not go back from the first step", () => {
      const state = verificationReducer(initialVerificationState, { type: "PREV_STEP" });
      expect(state.step).toBe("selfie");
    });

    it("goes from phone back to selfie", () => {
      const state = verificationReducer(buildState({ step: "phone" }), { type: "PREV_STEP" });
      expect(state.step).toBe("selfie");
    });

    it("goes from address back to phone", () => {
      const state = verificationReducer(buildState({ step: "address" }), { type: "PREV_STEP" });
      expect(state.step).toBe("phone");
    });

    it("does not go back from non-flow steps", () => {
      const state = verificationReducer(buildState({ step: "complete" }), { type: "PREV_STEP" });
      expect(state.step).toBe("complete");
    });
  });

  describe("VERIFY_START", () => {
    it("transitions to verifying", () => {
      const state = verificationReducer(
        buildState({ step: "address", address: validAddress }),
        { type: "VERIFY_START" },
      );
      expect(state.step).toBe("verifying");
    });
  });

  describe("VERIFY_SUCCESS", () => {
    it("transitions to complete and stores result", () => {
      const result = {
        selfieUrl: "data",
        phone: "+14155552671",
        address: validAddress,
        score: 85,
        status: "verified" as const,
      };
      const state = verificationReducer(buildState({ step: "verifying" }), {
        type: "VERIFY_SUCCESS",
        payload: result,
      });
      expect(state.step).toBe("complete");
      expect(state.result).toEqual(result);
    });
  });

  describe("VERIFY_FAILURE", () => {
    it("transitions to failed and stores result", () => {
      const result = {
        selfieUrl: "data",
        phone: "+14155552671",
        address: validAddress,
        score: 30,
        status: "failed" as const,
      };
      const state = verificationReducer(buildState({ step: "verifying" }), {
        type: "VERIFY_FAILURE",
        payload: result,
      });
      expect(state.step).toBe("failed");
      expect(state.result).toEqual(result);
    });
  });

  describe("RETRY", () => {
    it("resets to initial state", () => {
      const state = verificationReducer(
        buildState({
          step: "failed",
          selfie: "data",
          phone: "1234567890",
          countryCode: "US",
          address: validAddress,
        }),
        { type: "RETRY" },
      );
      expect(state).toEqual(initialVerificationState);
    });
  });

  describe("unknown action", () => {
    it("returns current state for unrecognized actions", () => {
      const state = buildState({ selfie: "data" });
      // @ts-expect-error testing unknown action
      const next = verificationReducer(state, { type: "UNKNOWN" });
      expect(next).toBe(state);
    });
  });

  describe("full flow integration", () => {
    it("walks through selfie → phone → address → verify → complete", () => {
      let state = initialVerificationState;

      state = verificationReducer(state, { type: "CAPTURE_SELFIE", payload: "selfie-img" });
      state = verificationReducer(state, { type: "NEXT_STEP" });
      expect(state.step).toBe("phone");

      state = verificationReducer(state, {
        type: "SET_PHONE",
        payload: { phone: "4155552671", countryCode: "US" },
      });
      state = verificationReducer(state, { type: "NEXT_STEP" });
      expect(state.step).toBe("address");

      state = verificationReducer(state, { type: "SET_ADDRESS", payload: validAddress });
      state = verificationReducer(state, { type: "VERIFY_START" });
      expect(state.step).toBe("verifying");

      const result = {
        selfieUrl: "selfie-img",
        phone: "+14155552671",
        address: validAddress,
        score: 92,
        status: "verified" as const,
      };
      state = verificationReducer(state, { type: "VERIFY_SUCCESS", payload: result });
      expect(state.step).toBe("complete");
      expect(state.result).toEqual(result);
    });

    it("supports failure → retry → restart flow", () => {
      let state = buildState({ step: "verifying", selfie: "data" });

      const result = {
        selfieUrl: "data",
        phone: "+14155552671",
        address: validAddress,
        score: 25,
        status: "failed" as const,
      };
      state = verificationReducer(state, { type: "VERIFY_FAILURE", payload: result });
      expect(state.step).toBe("failed");

      state = verificationReducer(state, { type: "RETRY" });
      expect(state).toEqual(initialVerificationState);
    });
  });
});
