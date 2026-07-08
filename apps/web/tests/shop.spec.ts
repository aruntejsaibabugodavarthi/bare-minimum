import { test, expect } from '@playwright/test';

test('shop page correctly loads via fallback proxy', async ({ page }) => {
  // Navigate to the shop page which is served by the Express backend proxy
  await page.goto('/shop');

  // Verify the page loaded correctly by checking for typical shop elements
  // The legacy HTML has a <title>Bare Minimum — Curated Essentials</title>
  await expect(page).toHaveTitle(/Bare Minimum/);

  // Check if a specific legacy element exists (e.g. navigation or product grid)
  const mainNav = page.locator('nav').first();
  await expect(mainNav).toBeVisible();

  // Shop page should not return 404
  const pageContent = await page.content();
  expect(pageContent).not.toContain('This page could not be found');
});
