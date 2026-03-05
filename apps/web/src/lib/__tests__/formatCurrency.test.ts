import { describe, it, expect } from "vitest";
import { formatCurrency } from "../formatCurrency";

describe("formatCurrency", () => {
  it("formats whole dollar amounts without decimals", () => {
    expect(formatCurrency(89)).toBe("$89");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("rounds fractional amounts to whole dollars", () => {
    expect(formatCurrency(99.99)).toBe("$100");
    expect(formatCurrency(99.49)).toBe("$99");
  });

  it("formats large amounts with comma separators", () => {
    expect(formatCurrency(1250)).toBe("$1,250");
    expect(formatCurrency(10000)).toBe("$10,000");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-50)).toBe("-$50");
  });
});
