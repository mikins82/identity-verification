import { describe, it, expect } from "vitest";
import { generateVerificationScore } from "../src/scoring";

describe("generateVerificationScore", () => {
  it("returns the same value for the same seed", () => {
    const a = generateVerificationScore(42);
    const b = generateVerificationScore(42);
    expect(a).toBe(b);
  });

  it("returns different values for different seeds", () => {
    const a = generateVerificationScore(1);
    const b = generateVerificationScore(2);
    expect(a).not.toBe(b);
  });

  it("always returns an integer in [0, 100]", () => {
    for (let seed = 0; seed < 1000; seed++) {
      const score = generateVerificationScore(seed);
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("produces ~30% failure rate over large sample (statistical)", () => {
    const iterations = 10_000;
    let failures = 0;

    for (let seed = 0; seed < iterations; seed++) {
      const score = generateVerificationScore(seed);
      if (score < 50) {
        failures++;
      }
    }

    // Expect ~3000 failures; allow 2000–4000 range for statistical tolerance
    expect(failures).toBeGreaterThan(2000);
    expect(failures).toBeLessThan(4000);
  });

  it("can produce score of 0", () => {
    let foundZero = false;
    for (let seed = 0; seed < 10_000; seed++) {
      if (generateVerificationScore(seed) === 0) {
        foundZero = true;
        break;
      }
    }
    expect(foundZero).toBe(true);
  });

  it("can produce score of 100", () => {
    let foundHundred = false;
    for (let seed = 0; seed < 10_000; seed++) {
      if (generateVerificationScore(seed) === 100) {
        foundHundred = true;
        break;
      }
    }
    expect(foundHundred).toBe(true);
  });

  it("can produce scores in both fail (< 50) and pass (>= 50) ranges", () => {
    let hasFailure = false;
    let hasSuccess = false;
    for (let seed = 0; seed < 100; seed++) {
      const score = generateVerificationScore(seed);
      if (score < 50) hasFailure = true;
      if (score >= 50) hasSuccess = true;
      if (hasFailure && hasSuccess) break;
    }
    expect(hasFailure).toBe(true);
    expect(hasSuccess).toBe(true);
  });

  it("returns a value without seed (non-deterministic)", () => {
    const score = generateVerificationScore();
    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
