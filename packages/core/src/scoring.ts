/**
 * Mulberry32 — a simple, fast, seedable 32-bit PRNG.
 * Returns a function that produces a new pseudo-random float in [0, 1) on each call.
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a verification score between 0 and 100.
 *
 * Distribution:
 * - ~30% chance of failure (score 0–49)
 * - ~70% chance of success (score 50–100)
 *
 * @param seed - Optional seed for deterministic output (useful in tests)
 */
export function generateVerificationScore(seed?: number): number {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;

  const shouldFail = random() < 0.3;
  if (shouldFail) {
    return Math.floor(random() * 50); // 0–49
  }
  return Math.floor(random() * 51) + 50; // 50–100
}
