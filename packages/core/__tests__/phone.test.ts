import { describe, it, expect } from "vitest";
import { validatePhone, normalizeToE164 } from "../src/validation/phone";

describe("validatePhone", () => {
  it("accepts a valid US number", () => {
    const result = validatePhone("4155552671", "US");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a valid US number with formatting", () => {
    const result = validatePhone("(415) 555-2671", "US");
    expect(result.valid).toBe(true);
  });

  it("accepts a valid UK number with leading zero", () => {
    const result = validatePhone("07911123456", "GB");
    expect(result.valid).toBe(true);
  });

  it("accepts a valid UK number without leading zero", () => {
    const result = validatePhone("7911123456", "GB");
    expect(result.valid).toBe(true);
  });

  it("accepts a number already prefixed with dial code", () => {
    const result = validatePhone("+14155552671", "US");
    expect(result.valid).toBe(true);
  });

  it("rejects a number that is too short", () => {
    const result = validatePhone("415555", "US");
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe("INVALID_LENGTH");
  });

  it("rejects empty input", () => {
    const result = validatePhone("", "US");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("REQUIRED");
  });

  it("rejects whitespace-only input", () => {
    const result = validatePhone("   ", "US");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("REQUIRED");
  });

  it("rejects non-digit input", () => {
    const result = validatePhone("abc", "US");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_FORMAT");
  });

  it("rejects unknown country code", () => {
    const result = validatePhone("1234567890", "XX");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("UNKNOWN_COUNTRY");
  });

  it("validates Mexico phone numbers", () => {
    const result = validatePhone("5512345678", "MX");
    expect(result.valid).toBe(true);
  });

  it("validates Germany phone numbers (range)", () => {
    const valid10 = validatePhone("1512345678", "DE");
    expect(valid10.valid).toBe(true);

    const valid11 = validatePhone("15123456789", "DE");
    expect(valid11.valid).toBe(true);

    const tooShort = validatePhone("151234567", "DE");
    expect(tooShort.valid).toBe(false);
  });

  it("validates France phone numbers", () => {
    const result = validatePhone("612345678", "FR");
    expect(result.valid).toBe(true);

    const withZero = validatePhone("0612345678", "FR");
    expect(withZero.valid).toBe(true);
  });

  it("validates India phone numbers", () => {
    const result = validatePhone("9876543210", "IN");
    expect(result.valid).toBe(true);
  });

  it("validates China phone numbers", () => {
    const result = validatePhone("13812345678", "CN");
    expect(result.valid).toBe(true);
  });

  it("handles case-insensitive country codes", () => {
    const result = validatePhone("4155552671", "us");
    expect(result.valid).toBe(true);
  });
});

describe("normalizeToE164", () => {
  it("normalizes US number to E.164", () => {
    expect(normalizeToE164("(415) 555-2671", "US")).toBe("+14155552671");
  });

  it("normalizes UK number stripping leading zero", () => {
    expect(normalizeToE164("07911123456", "GB")).toBe("+447911123456");
  });

  it("handles already-prefixed number without double-prefixing", () => {
    expect(normalizeToE164("+14155552671", "US")).toBe("+14155552671");
  });

  it("normalizes Mexico number", () => {
    expect(normalizeToE164("5512345678", "MX")).toBe("+525512345678");
  });

  it("normalizes France number with leading zero", () => {
    expect(normalizeToE164("0612345678", "FR")).toBe("+33612345678");
  });

  it("handles unknown country by stripping non-digits", () => {
    expect(normalizeToE164("123-456-7890", "XX")).toBe("+1234567890");
  });

  it("normalizes German number with dial prefix", () => {
    expect(normalizeToE164("+491512345678", "DE")).toBe("+491512345678");
  });

  it("normalizes Canadian number (shares +1 with US)", () => {
    expect(normalizeToE164("6135551234", "CA")).toBe("+16135551234");
  });
});
