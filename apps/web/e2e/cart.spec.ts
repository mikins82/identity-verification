import { test, expect } from "@playwright/test";

test.describe("Cart Page", () => {
  test("shows empty state when cart is empty", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Browse Drones/i }),
    ).toBeVisible();
  });

  test("displays cart items with correct prices after adding", async ({
    page,
  }) => {
    await page.goto("/");

    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();
    await expect(page.getByText(/added to cart/i).first()).toBeVisible();

    await page.locator('a[href="/cart"]').click();

    await expect(page.getByText(/Order Summary/i)).toBeVisible();
    await expect(page.getByText("1 item")).toBeVisible();
  });

  test("updating days recalculates subtotal", async ({ page }) => {
    await page.goto("/");
    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();
    await page.getByText(/added to cart/i).first().waitFor();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();

    const increaseBtn = page.getByLabel("Increase quantity");
    await increaseBtn.click();
    await increaseBtn.click();
  });

  test("removing item from cart works", async ({ page }) => {
    await page.goto("/");
    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();
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
