import { describe, it, expect } from "vitest";
import { validateAddress } from "../src/validation/address";
import type { Address } from "../src/types";

const validAddress: Address = {
  street: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  country: "United States",
  postalCode: "94102",
};

describe("validateAddress", () => {
  it("accepts a complete valid address", () => {
    const result = validateAddress(validAddress);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects missing street", () => {
    const result = validateAddress({ ...validAddress, street: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "street" && e.code === "REQUIRED")).toBe(true);
  });

  it("rejects missing city", () => {
    const result = validateAddress({ ...validAddress, city: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "city" && e.code === "REQUIRED")).toBe(true);
  });

  it("rejects missing state", () => {
    const result = validateAddress({ ...validAddress, state: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "state" && e.code === "REQUIRED")).toBe(true);
  });

  it("rejects missing country", () => {
    const result = validateAddress({ ...validAddress, country: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "country" && e.code === "REQUIRED")).toBe(true);
  });

  it("rejects missing postal code", () => {
    const result = validateAddress({ ...validAddress, postalCode: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "postalCode" && e.code === "REQUIRED")).toBe(true);
  });

  it("reports multiple missing fields", () => {
    const result = validateAddress({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(5);
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("street");
    expect(fields).toContain("city");
    expect(fields).toContain("state");
    expect(fields).toContain("country");
    expect(fields).toContain("postalCode");
  });

  it("rejects street that is too short", () => {
    const result = validateAddress({ ...validAddress, street: "AB" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "street" && e.code === "TOO_SHORT")).toBe(true);
  });

  it("accepts a street with exactly 3 characters", () => {
    const result = validateAddress({ ...validAddress, street: "1st" });
    expect(result.valid).toBe(true);
  });

  it("validates US postal code format", () => {
    const valid5 = validateAddress(validAddress, "US");
    expect(valid5.valid).toBe(true);

    const validZip4 = validateAddress(
      { ...validAddress, postalCode: "94102-1234" },
      "US",
    );
    expect(validZip4.valid).toBe(true);

    const invalid = validateAddress(
      { ...validAddress, postalCode: "ABCDE" },
      "US",
    );
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.some((e) => e.field === "postalCode" && e.code === "INVALID_FORMAT")).toBe(true);
  });

  it("validates UK postal code format", () => {
    const valid = validateAddress(
      { ...validAddress, postalCode: "SW1A 1AA" },
      "GB",
    );
    expect(valid.valid).toBe(true);

    const validNoSpace = validateAddress(
      { ...validAddress, postalCode: "SW1A1AA" },
      "GB",
    );
    expect(validNoSpace.valid).toBe(true);

    const invalid = validateAddress(
      { ...validAddress, postalCode: "12345" },
      "GB",
    );
    expect(invalid.valid).toBe(false);
  });

  it("validates German postal code format", () => {
    const valid = validateAddress(
      { ...validAddress, postalCode: "10115" },
      "DE",
    );
    expect(valid.valid).toBe(true);

    const invalid = validateAddress(
      { ...validAddress, postalCode: "1011" },
      "DE",
    );
    expect(invalid.valid).toBe(false);
  });

  it("validates Brazil postal code format", () => {
    const valid = validateAddress(
      { ...validAddress, postalCode: "01310-100" },
      "BR",
    );
    expect(valid.valid).toBe(true);

    const validNoHyphen = validateAddress(
      { ...validAddress, postalCode: "01310100" },
      "BR",
    );
    expect(validNoHyphen.valid).toBe(true);
  });

  it("accepts Unicode characters in city names", () => {
    const result = validateAddress({ ...validAddress, city: "São Paulo" });
    expect(result.valid).toBe(true);
  });

  it("accepts Unicode characters in street names", () => {
    const result = validateAddress({ ...validAddress, street: "Zürichbergstrasse 42" });
    expect(result.valid).toBe(true);
  });

  it("skips postal format check for unknown country", () => {
    const result = validateAddress(
      { ...validAddress, postalCode: "ANYTHING" },
      "XX",
    );
    expect(result.valid).toBe(true);
  });

  it("skips postal format check when no country code provided", () => {
    const result = validateAddress({
      ...validAddress,
      postalCode: "ANYTHING",
    });
    expect(result.valid).toBe(true);
  });

  it("trims whitespace-only fields", () => {
    const result = validateAddress({
      ...validAddress,
      city: "   ",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "city" && e.code === "REQUIRED")).toBe(true);
  });
});
