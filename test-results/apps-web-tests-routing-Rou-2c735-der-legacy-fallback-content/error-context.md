# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web/tests/routing.spec.ts >> Routing Security >> Admin routes should never render legacy fallback content
- Location: apps/web/tests/routing.spec.ts:4:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/admin", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Routing Security', () => {
  4  |   test('Admin routes should never render legacy fallback content', async ({ page }) => {
  5  |     // 1. Valid Next.js Admin page should load correctly (port 3001 proxy)
> 6  |     const adminRes = await page.goto('/admin');
     |                                 ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7  |     expect(adminRes?.status()).toBe(200);
  8  |     // Ensure legacy admin text is not present
  9  |     await expect(page.locator('text=Legacy')).toHaveCount(0);
  10 |     
  11 |     // 2. Case-insensitive spoofing should return a 404, NOT the legacy app
  12 |     const uppercaseAdminRes = await page.goto('/Admin');
  13 |     expect(uppercaseAdminRes?.status()).toBe(404);
  14 |     
  15 |     // 3. Trailing slash / nonsense paths should return a proper 404
  16 |     const nonsenseRes = await page.goto('/admin.html');
  17 |     expect(nonsenseRes?.status()).toBe(404);
  18 | 
  19 |     const randomAdminPath = await page.goto('/admin/nonsense123');
  20 |     expect(randomAdminPath?.status()).toBe(404);
  21 |   });
  22 | });
  23 | 
```