import { describe, it, expect, beforeEach } from "vitest";
import {
  useVerificationStore,
  selectIsVerified,
} from "../verificationStore";
import type { IdentityData } from "@identity-verification/core";

const verifiedIdentity: IdentityData = {
  selfieUrl: "data:image/png;base64,abc",
  phone: "+14155552671",
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postalCode: "94105",
  },
  score: 85,
  status: "verified",
};

const failedIdentity: IdentityData = {
  ...verifiedIdentity,
  score: 30,
  status: "failed",
};

function getState() {
  return useVerificationStore.getState();
}

describe("verificationStore", () => {
  beforeEach(() => {
    useVerificationStore.setState({ identityData: null });
  });

  it("starts with null identity data", () => {
    expect(getState().identityData).toBeNull();
  });

  describe("setIdentityData", () => {
    it("stores identity data", () => {
      getState().setIdentityData(verifiedIdentity);

      expect(getState().identityData).toEqual(verifiedIdentity);
    });

    it("overwrites previous identity data", () => {
      getState().setIdentityData(verifiedIdentity);
      getState().setIdentityData(failedIdentity);

      expect(getState().identityData).toEqual(failedIdentity);
    });
  });

  describe("reset", () => {
    it("clears identity data back to null", () => {
      getState().setIdentityData(verifiedIdentity);
      getState().reset();

      expect(getState().identityData).toBeNull();
    });
  });
});

describe("selectIsVerified", () => {
  beforeEach(() => {
    useVerificationStore.setState({ identityData: null });
  });

  it("returns false when no identity data exists", () => {
    expect(selectIsVerified(getState())).toBe(false);
  });

  it("returns true for verified status", () => {
    getState().setIdentityData(verifiedIdentity);

    expect(selectIsVerified(getState())).toBe(true);
  });

  it("returns false for failed status", () => {
    getState().setIdentityData(failedIdentity);

    expect(selectIsVerified(getState())).toBe(false);
  });
});
