import { test, expect } from "@playwright/test";

test.describe("Catalog Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays page heading and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Drone Catalog/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Browse our fleet/i),
    ).toBeVisible();
  });

  test("shows 6 drone cards initially (all tab)", async ({ page }) => {
    const cards = page.locator("[data-testid='drone-card']");
    await expect(cards).toHaveCount(6);
  });

  test("category tabs filter drones correctly", async ({ page }) => {
    await page.getByRole("tab", { name: /Filming/i }).click();
    let cards = page.locator("[data-testid='drone-card']");
    await expect(cards).toHaveCount(3);

    await page.getByRole("tab", { name: /Cargo/i }).click();
    cards = page.locator("[data-testid='drone-card']");
    await expect(cards).toHaveCount(3);

    await page.getByRole("tab", { name: /All/i }).click();
    cards = page.locator("[data-testid='drone-card']");
    await expect(cards).toHaveCount(6);
  });

  test("clicking a drone card opens the detail modal", async ({ page }) => {
    const firstCard = page.locator("[data-testid='drone-card']").first();
    await firstCard.click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  });

  test("detail modal shows date picker and add to cart", async ({ page }) => {
    const firstCard = page.locator("[data-testid='drone-card']").first();
    await firstCard.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(dialog.locator("input[type='date']")).toHaveCount(2);
    await expect(dialog.getByText(/day.*rental/i)).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  });

  test("add to cart from modal shows toast and closes modal", async ({ page }) => {
    const firstCard = page.locator("[data-testid='drone-card']").first();
    await firstCard.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Add to Cart" }).click();

    await expect(page.getByText(/added to cart/i).first()).toBeVisible();
    await expect(dialog).not.toBeVisible();
  });

  test("adding multiple drones to cart via modal", async ({ page }) => {
    const cards = page.locator("[data-testid='drone-card']");

    await cards.nth(0).click();
    await page.getByRole("dialog").getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByText(/added to cart/i).first()).toBeVisible();

    await cards.nth(1).click();
    await page.getByRole("dialog").getByRole("button", { name: "Add to Cart" }).click();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();
  });
});
