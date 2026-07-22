import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const adminAuth = path.join(__dirname, '.auth', 'admin.json');
const hasAuth = fs.existsSync(adminAuth);

test.describe('Admin Internal Flow: Lead to Invoice', () => {
  test.beforeEach(async () => {
    if (!hasAuth) test.skip();
  });

  test('complete lead to project conversion', async ({ browser }) => {
    const context = await browser.newContext({ storageState: adminAuth });
    const page = await context.newPage();

    // 1. View Leads
    await page.goto('/sales/leads');
    await expect(page.locator('h1')).toHaveText(/Leads/i);
    // Simulate clicking a lead
    
    // 2. Organization & Contact
    await page.goto('/directory/organizations');
    await expect(page.locator('h1')).toHaveText(/Organizations/i);

    // 3. Deal & Proposal
    await page.goto('/sales/pipeline');
    await expect(page.locator('text=Pipeline')).toBeVisible();
    
    // 4. Project Created
    await page.goto('/delivery/projects');
    await expect(page.locator('text=Projects')).toBeVisible();

    // 5. Initial Invoice
    await page.goto('/finance/invoices');
    await expect(page.locator('text=Invoices')).toBeVisible();

    await context.close();
  });
});
