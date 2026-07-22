import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const adminAuth = path.join(__dirname, '.auth', 'admin.json');
const hasAuth = fs.existsSync(adminAuth);

test.describe('Golden Path Smoke Test', () => {
  test.beforeEach(async () => {
    if (!hasAuth) test.skip();
  });

  test('admin can navigate core workflows', async ({ browser }) => {
    const context = await browser.newContext({ storageState: adminAuth });
    const page = await context.newPage();

    // 1. Check Sales Pipeline
    await page.goto('/sales/leads');
    await expect(page.locator('text=Leads')).toBeVisible();

    // 2. Check Directory
    await page.goto('/directory/organizations');
    await expect(page.locator('text=Organizations')).toBeVisible();

    // 3. Check Delivery Projects
    await page.goto('/delivery/projects');
    await expect(page.locator('text=Projects')).toBeVisible();

    // 4. Check Finance Invoices
    await page.goto('/finance/invoices');
    await expect(page.locator('text=Invoices')).toBeVisible();

    // 5. Check Finance Payments
    await page.goto('/finance/payments');
    await expect(page.locator('text=Payments')).toBeVisible();

    await context.close();
  });
});
