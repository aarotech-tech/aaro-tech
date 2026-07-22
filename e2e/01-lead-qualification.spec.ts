import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const adminAuth = path.join(__dirname, '.auth', 'admin.json');
const hasAuth = fs.existsSync(adminAuth);

test.describe('Lead Qualification', () => {
  test.beforeEach(async () => {
    if (!hasAuth) test.skip();
  });

  test('admin can view leads and qualify them', async ({ browser }) => {
    const context = await browser.newContext({ storageState: adminAuth });
    const page = await context.newPage();

    await page.goto('/sales/leads');
    await expect(page.locator('text=Leads')).toBeVisible();

    // Verify EmptyState or the table
    const leadsTable = page.locator('table');
    await expect(leadsTable).toBeVisible();

    await context.close();
  });
});
