import { test, expect } from "@playwright/test";
import { mockCamera } from "./helpers/mockCamera";
import { mockScoring } from "./helpers/mockScoring";

async function completeVerificationFlow(page: import("@playwright/test").Page) {
  await page.goto("/");

  const firstAddButton = page
    .getByRole("button", { name: "Add to Cart" })
    .first();
  await firstAddButton.click();
  await page.getByText(/added to cart/i).first().waitFor();

  await page.locator('a[href="/cart"]').click();
  await page.getByRole("link", { name: /Proceed to Verification/i }).click();

  const takePhotoButton = page.getByLabel("Take photo");
  await takePhotoButton.waitFor({ state: "visible", timeout: 15000 });
  await takePhotoButton.click();

  const usePhotoButton = page.getByRole("button", { name: "Use this photo" });
  await usePhotoButton.waitFor({ state: "visible", timeout: 5000 });
  await usePhotoButton.click();
  await page.getByRole("button", { name: /next/i }).click();

  const phoneInput = page.getByLabel("Phone number");
  await phoneInput.waitFor({ state: "visible", timeout: 5000 });
  await phoneInput.fill("4155552671");
  await page.getByRole("button", { name: /next/i }).click();

  await page.locator('input[placeholder="123 Main St"]').fill("123 Main St");
  await page.locator('input[placeholder="City"]').fill("San Francisco");
  await page.locator('input[placeholder="State"]').fill("CA");
  await page.locator('input[placeholder="Postal code"]').fill("94102");

  await page.getByRole("button", { name: /submit verification/i }).click();

  await expect(page.getByText(/Verification Passed/i)).toBeVisible({
    timeout: 10000,
  });

  await page.getByRole("link", { name: /Proceed to Checkout/i }).click();
}

test.describe("Checkout Page", () => {
  test("displays cart summary with correct info", async ({ page }) => {
    await mockCamera(page);
    await mockScoring(page, { forcePass: true });
    await completeVerificationFlow(page);

    await expect(
      page.getByRole("heading", { name: /checkout/i }),
    ).toBeVisible();
    await expect(page.getByText(/Verified Identity/i)).toBeVisible();
  });

  test("complete rental button shows confirmation", async ({ page }) => {
    await mockCamera(page);
    await mockScoring(page, { forcePass: true });
    await completeVerificationFlow(page);

    await page.getByRole("button", { name: /Complete Rental/i }).click();

    await expect(
      page.getByRole("heading", { name: "Rental Confirmed", level: 1 }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/SR-/)).toBeVisible();
  });

  test("checkout page shows verified identity card", async ({ page }) => {
    await mockCamera(page);
    await mockScoring(page, { forcePass: true });
    await completeVerificationFlow(page);

    await expect(page.getByText(/Verified Identity/i)).toBeVisible();
    await expect(page.getByText("+14155552671")).toBeVisible();
  });
});
