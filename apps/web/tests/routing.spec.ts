import { test, expect } from '@playwright/test';

test.describe('Routing Security', () => {
  test('Admin routes should never render legacy fallback content', async ({ page }) => {
    // 1. Valid Next.js Admin page should load correctly (port 3001 proxy)
    const adminRes = await page.goto('/admin');
    expect(adminRes?.status()).toBe(200);
    // Ensure legacy admin text is not present
    await expect(page.locator('text=Legacy')).toHaveCount(0);

    // 2. Case-insensitive spoofing should return a 404, NOT the legacy app
    const uppercaseAdminRes = await page.goto('/Admin');
    expect(uppercaseAdminRes?.status()).toBe(404);

    // 3. Trailing slash / nonsense paths should return a proper 404
    const nonsenseRes = await page.goto('/admin.html');
    expect(nonsenseRes?.status()).toBe(404);

    const randomAdminPath = await page.goto('/admin/nonsense123');
    expect(randomAdminPath?.status()).toBe(404);
  });
});
