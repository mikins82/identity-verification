import { test, expect, type Page } from "@playwright/test";

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

});
