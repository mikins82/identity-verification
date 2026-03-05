import { test, expect, type Page } from "@playwright/test";
import { mockCamera } from "./helpers/mockCamera";
import { mockScoring } from "./helpers/mockScoring";

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };

test.describe("Responsive: Mobile (375px)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("catalog renders drone cards in single column", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Drone Catalog/i }),
    ).toBeVisible();

    const addButtons = page.getByRole("button", { name: "Add to Cart" });
    await expect(addButtons.first()).toBeVisible();
  });

  test("cart page is usable at mobile width", async ({ page }) => {
    await page.goto("/");

    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();
    await page.getByText(/added to cart/i).first().waitFor();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();

    const increaseBtn = page.getByLabel("Increase quantity");
    await expect(increaseBtn).toBeVisible();
  });

  test("verification flow is usable at mobile width", async ({ page }) => {
    await mockCamera(page);
    await mockScoring(page, { forcePass: true });

    await page.goto("/");
    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();
    await page.getByText(/added to cart/i).first().waitFor();

    await page.locator('a[href="/cart"]').click();
    await page.getByRole("link", { name: /Proceed to Verification/i }).click();

    await expect(
      page.getByRole("heading", { name: /Identity Verification/i }),
    ).toBeVisible();

    const takePhotoButton = page.getByLabel("Take photo");
    await takePhotoButton.waitFor({ state: "visible", timeout: 15000 });
    await expect(takePhotoButton).toBeVisible();
  });
});

test.describe("Responsive: Tablet (768px)", () => {
  test.use({ viewport: TABLET_VIEWPORT });

  test("catalog renders drone cards in multi-column grid", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Drone Catalog/i }),
    ).toBeVisible();

    const addButtons = page.getByRole("button", { name: "Add to Cart" });
    await expect(addButtons).toHaveCount(6);
  });

  test("checkout page scrolls properly", async ({ page }) => {
    await mockCamera(page);
    await mockScoring(page, { forcePass: true });

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

    const usePhotoButton = page.getByRole("button", {
      name: "Use this photo",
    });
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

    await expect(
      page.getByRole("heading", { name: /checkout/i }),
    ).toBeVisible();
  });
});
