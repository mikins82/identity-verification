import { test, expect } from "@playwright/test";
import { mockCamera } from "./helpers/mockCamera";
import { mockScoring } from "./helpers/mockScoring";

test.describe("Verification Flow", () => {
  test("happy path: catalog → cart → verify → checkout → confirmation", async ({
    page,
  }) => {
    await mockCamera(page);
    await mockScoring(page, { forcePass: true });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Drone Catalog/i })).toBeVisible();

    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();
    await expect(page.getByText(/added to cart/i).first()).toBeVisible();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();

    await page.getByRole("link", { name: /Proceed to Verification/i }).click();
    await expect(
      page.getByRole("heading", { name: /Identity Verification/i }),
    ).toBeVisible();

    // Step 1: Selfie — wait for mock camera to initialize
    const takePhotoButton = page.getByLabel("Take photo");
    await takePhotoButton.waitFor({ state: "visible", timeout: 15000 });
    await takePhotoButton.click();

    const usePhotoButton = page.getByRole("button", { name: "Use this photo" });
    await usePhotoButton.waitFor({ state: "visible", timeout: 5000 });
    await usePhotoButton.click();

    await expect(page.getByText("Photo captured")).toBeVisible();
    await page.getByRole("button", { name: /next/i }).click();

    // Step 2: Phone
    const phoneInput = page.getByLabel("Phone number");
    await phoneInput.waitFor({ state: "visible", timeout: 5000 });
    await phoneInput.fill("4155552671");
    await page.getByRole("button", { name: /next/i }).click();

    // Step 3: Address — fill all required fields
    await page.locator('input[placeholder="123 Main St"]').fill("123 Main St");
    await page.locator('input[placeholder="City"]').fill("San Francisco");
    await page.locator('input[placeholder="State"]').fill("CA");
    await page.locator('input[placeholder="Postal code"]').fill("94102");

    await page.getByRole("button", { name: /submit verification/i }).click();

    // Result page — verification passes with mocked score 75
    await expect(page.getByText(/Verification Passed/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Score: 75/i)).toBeVisible();

    await page.getByRole("link", { name: /Proceed to Checkout/i }).click();

    // Checkout page
    await expect(
      page.getByRole("heading", { name: /checkout/i }),
    ).toBeVisible();
    await expect(page.getByText(/Verified Identity/i)).toBeVisible();

    await page.getByRole("button", { name: /Complete Rental/i }).click();

    // Confirmation page
    await expect(
      page.getByRole("heading", { name: "Rental Confirmed", level: 1 }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/SR-/)).toBeVisible();
  });

  test("failed verification shows retry option", async ({ page }) => {
    await mockCamera(page);
    await mockScoring(page, { forcePass: false });

    await page.goto("/");

    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();
    await expect(page.getByText(/added to cart/i).first()).toBeVisible();

    await page.locator('a[href="/cart"]').click();
    await page.getByRole("link", { name: /Proceed to Verification/i }).click();

    // Selfie
    const takePhotoButton = page.getByLabel("Take photo");
    await takePhotoButton.waitFor({ state: "visible", timeout: 15000 });
    await takePhotoButton.click();

    const usePhotoButton = page.getByRole("button", { name: "Use this photo" });
    await usePhotoButton.waitFor({ state: "visible", timeout: 5000 });
    await usePhotoButton.click();
    await page.getByRole("button", { name: /next/i }).click();

    // Phone
    const phoneInput = page.getByLabel("Phone number");
    await phoneInput.waitFor({ state: "visible", timeout: 5000 });
    await phoneInput.fill("4155552671");
    await page.getByRole("button", { name: /next/i }).click();

    // Address
    await page.locator('input[placeholder="123 Main St"]').fill("123 Main St");
    await page.locator('input[placeholder="City"]').fill("San Francisco");
    await page.locator('input[placeholder="State"]').fill("CA");
    await page.locator('input[placeholder="Postal code"]').fill("94102");

    await page.getByRole("button", { name: /submit verification/i }).click();

    // Result page — verification fails with mocked score 5
    await expect(page.getByText(/Verification Failed/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Score: 5/i)).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Try Again/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Back to Cart/i }),
    ).toBeVisible();
  });
});
