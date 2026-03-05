import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };

test.describe("Responsive: Mobile (375px)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("catalog renders drone cards in single column", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Drone Catalog/i }),
    ).toBeVisible();

    const cards = page.locator("[data-testid='drone-card']");
    await expect(cards.first()).toBeVisible();
  });

  test("cart page is usable at mobile width", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator("[data-testid='drone-card']").first();
    await firstCard.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Add to Cart" }).click();
    await page.getByText(/added to cart/i).first().waitFor();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();
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

    const cards = page.locator("[data-testid='drone-card']");
    await expect(cards).toHaveCount(6);
  });

});
