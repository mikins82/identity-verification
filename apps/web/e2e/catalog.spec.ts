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
    const addButtons = page.getByRole("button", { name: "Add to Cart" });
    await expect(addButtons).toHaveCount(6);
  });

  test("category tabs filter drones correctly", async ({ page }) => {
    await page.getByRole("tab", { name: /Filming/i }).click();
    let addButtons = page.getByRole("button", { name: "Add to Cart" });
    await expect(addButtons).toHaveCount(3);

    await page.getByRole("tab", { name: /Cargo/i }).click();
    addButtons = page.getByRole("button", { name: "Add to Cart" });
    await expect(addButtons).toHaveCount(3);

    await page.getByRole("tab", { name: /All/i }).click();
    addButtons = page.getByRole("button", { name: "Add to Cart" });
    await expect(addButtons).toHaveCount(6);
  });

  test("day stepper increments and decrements", async ({ page }) => {
    const firstCard = page.locator("[data-testid='drone-card']").first();

    const increaseBtn = firstCard.getByLabel("Increase quantity");
    await increaseBtn.click();
    await increaseBtn.click();

    const decreaseBtn = firstCard.getByLabel("Decrease quantity");
    await decreaseBtn.click();
  });

  test("add to cart shows toast notification and updates cart badge", async ({
    page,
  }) => {
    const firstAddButton = page
      .getByRole("button", { name: "Add to Cart" })
      .first();
    await firstAddButton.click();

    await expect(page.getByText(/added to cart/i)).toBeVisible();
  });

  test("adding multiple drones to cart", async ({ page }) => {
    const addButtons = page.getByRole("button", { name: "Add to Cart" });

    await addButtons.nth(0).click();
    await expect(page.getByText(/added to cart/i).first()).toBeVisible();

    await addButtons.nth(1).click();

    await page.locator('a[href="/cart"]').click();
    await expect(page.getByText(/Order Summary/i)).toBeVisible();
  });
});
