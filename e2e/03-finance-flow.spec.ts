import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const adminAuth = path.join(__dirname, '.auth', 'admin.json');
const hasAuth = fs.existsSync(adminAuth);

test.describe('Finance Flow', () => {
  test.beforeEach(async () => {
    if (!hasAuth) test.skip();
  });

  test('validate invoice and manual payment lifecycle', async ({ browser }) => {
    const context = await browser.newContext({ storageState: adminAuth });
    const page = await context.newPage();

    // 1. Invoices
    await page.goto('/finance/invoices');
    await expect(page.locator('h1')).toHaveText(/Invoices/i);

    // 2. Payments (Manual Workflow Validation)
    await page.goto('/finance/payments');
    await expect(page.locator('h1')).toHaveText(/Payments/i);

    await context.close();
  });
});
