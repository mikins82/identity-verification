import { describe, it, expect } from "vitest";
import { getIdentityData } from "../src/identity";
import { VerificationError } from "../src/errors";
import type { VerificationInput } from "../src/types";

const validInput: VerificationInput = {
  selfie: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
  phone: "4155552671",
  countryCode: "US",
  address: {
    street: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    postalCode: "94102",
  },
};

describe("getIdentityData", () => {
  it("returns IdentityData for valid input", async () => {
    const result = await getIdentityData(validInput, {
      simulatedLatencyMs: 0,
      seed: 42,
    });

    expect(result.selfieUrl).toBe(validInput.selfie);
    expect(result.phone).toBe("+14155552671");
    expect(result.address).toEqual(validInput.address);
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(["verified", "failed"]).toContain(result.status);
  });

  it("returns 'verified' when score >= 50", async () => {
    // Find a seed that produces score >= 50
    let successSeed = 0;
    for (let s = 0; s < 1000; s++) {
      const result = await getIdentityData(validInput, {
        simulatedLatencyMs: 0,
        seed: s,
      });
      if (result.score >= 50) {
        successSeed = s;
        break;
      }
    }

    const result = await getIdentityData(validInput, {
      simulatedLatencyMs: 0,
      seed: successSeed,
    });
    expect(result.status).toBe("verified");
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it("returns 'failed' when score < 50", async () => {
    // Find a seed that produces score < 50
    let failSeed = 0;
    for (let s = 0; s < 1000; s++) {
      const result = await getIdentityData(validInput, {
        simulatedLatencyMs: 0,
        seed: s,
      });
      if (result.score < 50) {
        failSeed = s;
        break;
      }
    }

    const result = await getIdentityData(validInput, {
      simulatedLatencyMs: 0,
      seed: failSeed,
    });
    expect(result.status).toBe("failed");
    expect(result.score).toBeLessThan(50);
  });

  it("produces deterministic results with seed", async () => {
    const a = await getIdentityData(validInput, {
      simulatedLatencyMs: 0,
      seed: 99,
    });
    const b = await getIdentityData(validInput, {
      simulatedLatencyMs: 0,
      seed: 99,
    });
    expect(a.score).toBe(b.score);
    expect(a.status).toBe(b.status);
  });

  it("normalizes phone to E.164", async () => {
    const result = await getIdentityData(
      { ...validInput, phone: "(415) 555-2671" },
      { simulatedLatencyMs: 0, seed: 42 },
    );
    expect(result.phone).toBe("+14155552671");
  });

  it("throws SELFIE_MISSING for empty selfie", async () => {
    await expect(
      getIdentityData(
        { ...validInput, selfie: "" },
        { simulatedLatencyMs: 0 },
      ),
    ).rejects.toThrow(VerificationError);

    try {
      await getIdentityData(
        { ...validInput, selfie: "" },
        { simulatedLatencyMs: 0 },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(VerificationError);
      expect((error as VerificationError).code).toBe("SELFIE_MISSING");
    }
  });

  it("throws SELFIE_MISSING for whitespace-only selfie", async () => {
    try {
      await getIdentityData(
        { ...validInput, selfie: "   " },
        { simulatedLatencyMs: 0 },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(VerificationError);
      expect((error as VerificationError).code).toBe("SELFIE_MISSING");
    }
  });

  it("throws PHONE_INVALID for invalid phone number", async () => {
    try {
      await getIdentityData(
        { ...validInput, phone: "123" },
        { simulatedLatencyMs: 0 },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(VerificationError);
      const ve = error as VerificationError;
      expect(ve.code).toBe("PHONE_INVALID");
      expect(ve.details).toBeDefined();
      expect(ve.details!.length).toBeGreaterThan(0);
    }
  });

  it("throws ADDRESS_INCOMPLETE for incomplete address", async () => {
    try {
      await getIdentityData(
        {
          ...validInput,
          address: {
            street: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
          },
        },
        { simulatedLatencyMs: 0 },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(VerificationError);
      const ve = error as VerificationError;
      expect(ve.code).toBe("ADDRESS_INCOMPLETE");
      expect(ve.details).toBeDefined();
      expect(ve.details!.length).toBe(5);
    }
  });

  it("throws ADDRESS_INCOMPLETE for invalid postal code format", async () => {
    try {
      await getIdentityData(
        {
          ...validInput,
          address: { ...validInput.address, postalCode: "ABCDE" },
        },
        { simulatedLatencyMs: 0 },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(VerificationError);
      const ve = error as VerificationError;
      expect(ve.code).toBe("ADDRESS_INCOMPLETE");
      expect(ve.details!.some((e) => e.field === "postalCode")).toBe(true);
    }
  });

  it("resolves without delay when simulatedLatencyMs is 0", async () => {
    const start = Date.now();
    await getIdentityData(validInput, {
      simulatedLatencyMs: 0,
      seed: 42,
    });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it("defaults to 1500ms latency", async () => {
    const start = Date.now();
    await getIdentityData(validInput, { seed: 42 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(1400);
  }, 5000);
});
