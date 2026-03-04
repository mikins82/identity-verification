import type { Page } from "@playwright/test";

/**
 * Overrides Math.random with a deterministic value to control verification scores.
 * Must be called BEFORE page.goto() since it uses addInitScript.
 *
 * With forcePass: true  → Math.random returns 0.5 → score 75 (verified)
 * With forcePass: false → Math.random returns 0.1 → score 5  (failed)
 */
export async function mockScoring(
  page: Page,
  options: { forcePass: boolean } = { forcePass: true },
): Promise<void> {
  const value = options.forcePass ? 0.5 : 0.1;

  await page.addInitScript(`{
    const _fixedValue = ${value};
    Math.random = () => _fixedValue;
  }`);
}
