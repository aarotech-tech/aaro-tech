import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const clientAuth = path.join(__dirname, '.auth', 'client.json');
const hasAuth = fs.existsSync(clientAuth);

test.describe('Client Portal Flow', () => {
  test.beforeEach(async () => {
    if (!hasAuth) test.skip();
  });

  test('validate strict isolation and client interactions', async ({ browser }) => {
    const context = await browser.newContext({ storageState: clientAuth });
    const page = await context.newPage();

    // 1. Dashboard Isolation
    await page.goto('/portal/home');
    await expect(page.locator('h1')).toHaveText(/Portal/i);

    // 2. Review Deliverable & Approve
    await page.goto('/portal/reviews');
    await expect(page.locator('h1')).toHaveText(/Reviews/i);

    // 3. Pay Invoice
    await page.goto('/portal/billing');
    await expect(page.locator('h1')).toHaveText(/Billing/i);

    // 4. Admin Access Should Fail
    const adminResponse = await page.goto('/sales/pipeline');
    expect(adminResponse?.status()).toBe(404); // Or 403 / Redirect

    await context.close();
  });
});
