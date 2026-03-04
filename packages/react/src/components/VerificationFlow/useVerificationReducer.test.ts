import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useVerificationReducer } from "./useVerificationReducer";
import type { IdentityData, Address } from "@identity-verification/core";

const validAddress: Address = {
  street: "123 Main St",
  city: "San Francisco",
  state: "CA",
  country: "US",
  postalCode: "94102",
};

const successResult: IdentityData = {
  selfieUrl: "data:image/jpeg;base64,abc",
  phone: "+14155552671",
  address: validAddress,
  score: 85,
  status: "verified",
};

const failedResult: IdentityData = {
  selfieUrl: "data:image/jpeg;base64,abc",
  phone: "+14155552671",
  address: validAddress,
  score: 20,
  status: "failed",
};

describe("useVerificationReducer", () => {
  it("initializes at the selfie step", () => {
    const { result } = renderHook(() => useVerificationReducer());
    expect(result.current.state.step).toBe("selfie");
    expect(result.current.stepIndex).toBe(0);
  });

  it("starts with null selfie, null phone, and empty address", () => {
    const { result } = renderHook(() => useVerificationReducer());
    expect(result.current.state.selfie).toBeNull();
    expect(result.current.state.phone).toBeNull();
    expect(result.current.state.address).toEqual({});
  });

  it("cannot advance from selfie without a capture", () => {
    const { result } = renderHook(() => useVerificationReducer());
    expect(result.current.canAdvance).toBe(false);
  });

  it("captures selfie and allows advancing", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));

    expect(result.current.state.selfie).toBe("data:image/jpeg;base64,abc");
    expect(result.current.canAdvance).toBe(true);
  });

  it("advances from selfie to phone step", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());

    expect(result.current.state.step).toBe("phone");
    expect(result.current.stepIndex).toBe(1);
  });

  it("cannot advance from phone without a phone number", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());

    expect(result.current.canAdvance).toBe(false);
  });

  it("sets phone and country code", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());
    act(() => result.current.setPhone("4155552671", "US"));

    expect(result.current.state.phone).toBe("4155552671");
    expect(result.current.state.countryCode).toBe("US");
    expect(result.current.canAdvance).toBe(true);
  });

  it("advances from phone to address step", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());
    act(() => result.current.setPhone("4155552671", "US"));
    act(() => result.current.nextStep());

    expect(result.current.state.step).toBe("address");
    expect(result.current.stepIndex).toBe(2);
  });

  it("sets address data", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.setAddress(validAddress));

    expect(result.current.state.address).toEqual(validAddress);
  });

  it("navigates back from phone to selfie", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());
    act(() => result.current.prevStep());

    expect(result.current.state.step).toBe("selfie");
    expect(result.current.state.selfie).toBe("data:image/jpeg;base64,abc");
  });

  it("navigates back from address to phone", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());
    act(() => result.current.setPhone("4155552671", "US"));
    act(() => result.current.nextStep());
    act(() => result.current.prevStep());

    expect(result.current.state.step).toBe("phone");
    expect(result.current.state.phone).toBe("4155552671");
  });

  it("transitions to verifying state on startVerify", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.startVerify());

    expect(result.current.state.step).toBe("verifying");
  });

  it("transitions to complete on verifySuccess", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.startVerify());
    act(() => result.current.verifySuccess(successResult));

    expect(result.current.state.step).toBe("complete");
    expect(result.current.state.result).toEqual(successResult);
  });

  it("transitions to failed on verifyFailure", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.startVerify());
    act(() => result.current.verifyFailure(failedResult));

    expect(result.current.state.step).toBe("failed");
    expect(result.current.state.result).toEqual(failedResult);
  });

  it("resets state on retry", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());
    act(() => result.current.setPhone("4155552671", "US"));
    act(() => result.current.nextStep());
    act(() => result.current.setAddress(validAddress));
    act(() => result.current.startVerify());
    act(() => result.current.verifyFailure(failedResult));
    act(() => result.current.retry());

    expect(result.current.state.step).toBe("selfie");
    expect(result.current.state.selfie).toBeNull();
    expect(result.current.state.phone).toBeNull();
    expect(result.current.state.address).toEqual({});
    expect(result.current.state.result).toBeNull();
  });

  it("returns stable action functions across rerenders", () => {
    const { result, rerender } = renderHook(() => useVerificationReducer());

    const {
      captureSelfie,
      setPhone,
      setAddress,
      nextStep,
      prevStep,
      startVerify,
      verifySuccess,
      verifyFailure,
      retry,
    } = result.current;

    rerender();

    expect(result.current.captureSelfie).toBe(captureSelfie);
    expect(result.current.setPhone).toBe(setPhone);
    expect(result.current.setAddress).toBe(setAddress);
    expect(result.current.nextStep).toBe(nextStep);
    expect(result.current.prevStep).toBe(prevStep);
    expect(result.current.startVerify).toBe(startVerify);
    expect(result.current.verifySuccess).toBe(verifySuccess);
    expect(result.current.verifyFailure).toBe(verifyFailure);
    expect(result.current.retry).toBe(retry);
  });

  it("prevStep does nothing at the first step", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.prevStep());

    expect(result.current.state.step).toBe("selfie");
    expect(result.current.stepIndex).toBe(0);
  });

  it("tracks the full selfie -> phone -> address -> verify -> complete flow", () => {
    const { result } = renderHook(() => useVerificationReducer());

    expect(result.current.state.step).toBe("selfie");

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    act(() => result.current.nextStep());
    expect(result.current.state.step).toBe("phone");

    act(() => result.current.setPhone("4155552671", "US"));
    act(() => result.current.nextStep());
    expect(result.current.state.step).toBe("address");

    act(() => result.current.setAddress(validAddress));
    act(() => result.current.startVerify());
    expect(result.current.state.step).toBe("verifying");

    act(() => result.current.verifySuccess(successResult));
    expect(result.current.state.step).toBe("complete");
    expect(result.current.state.result?.status).toBe("verified");
  });

  it("overwrites selfie when recaptured with a new value", () => {
    const { result } = renderHook(() => useVerificationReducer());

    act(() => result.current.captureSelfie("data:image/jpeg;base64,abc"));
    expect(result.current.state.selfie).toBe("data:image/jpeg;base64,abc");

    act(() => result.current.captureSelfie("data:image/jpeg;base64,xyz"));
    expect(result.current.state.selfie).toBe("data:image/jpeg;base64,xyz");
    expect(result.current.canAdvance).toBe(true);
  });
});
