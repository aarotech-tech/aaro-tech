import { test, expect } from '@playwright/test';

test.describe('Authentication & Routing', () => {
  test('unauthenticated users are redirected from /crm to login', async ({ page }) => {
    const res = await page.goto('/crm');
    // We expect Clerk middleware to intercept and redirect to sign-in page
    expect(page.url()).toContain('sign-in');
  });

  test('unauthenticated users are redirected from /portal to login', async ({ page }) => {
    const res = await page.goto('/portal');
    expect(page.url()).toContain('sign-in');
  });

  test('public pages are accessible without authentication', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    
    // Check key layout elements exist (header is always present)
    await expect(page.locator('header').first()).toBeVisible();
    // 'About' and 'Services' are confirmed nav links in the header
    await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
  });
});
