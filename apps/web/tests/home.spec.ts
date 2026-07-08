import { test, expect } from '@playwright/test';

test('homepage has expected title and elements', async ({ page }) => {
  // Navigate to the Next.js home page
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Bare Minimum/);

  // Expect the main heading to be visible
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();
});
