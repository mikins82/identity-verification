import { test, expect } from "@playwright/test";

test.describe("Cart Page", () => {
  test("shows empty state when cart is empty", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Browse Drones/i }),
    ).toBeVisible();
  });

  test("displays cart items after adding via modal", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator("[data-testid='drone-card']").first();
    await firstCard.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByText(/added to cart/i).first()).toBeVisible();

    await page.locator('a[href="/cart"]').click();

    await expect(page.getByText(/Order Summary/i)).toBeVisible();
    await expect(page.getByText("1 item")).toBeVisible();
  });

  test("cart item shows date range", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator("[data-testid='drone-card']").first();
    await firstCard.click();
    await page.getByRole("dialog").getByRole("button", { name: "Add to Cart" }).click();
    await page.getByText(/added to cart/i).first().waitFor();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();

    await expect(page.getByText(/day/i).first()).toBeVisible();
  });

  test("removing item from cart works", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator("[data-testid='drone-card']").first();
    await firstCard.click();
    await page.getByRole("dialog").getByRole("button", { name: "Add to Cart" }).click();
    await page.getByText(/added to cart/i).first().waitFor();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();

    const removeButton = page
      .getByRole("button", { name: /Remove/i })
      .first();
    await removeButton.click();

    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });
});
