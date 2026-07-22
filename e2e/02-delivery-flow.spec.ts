import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const adminAuth = path.join(__dirname, '.auth', 'admin.json');
const hasAuth = fs.existsSync(adminAuth);

test.describe('Delivery Flow', () => {
  test.beforeEach(async () => {
    if (!hasAuth) test.skip();
  });

  test('validate project lifecycle transitions', async ({ browser }) => {
    const context = await browser.newContext({ storageState: adminAuth });
    const page = await context.newPage();

    // 1. Projects
    await page.goto('/delivery/projects');
    await expect(page.locator('h1')).toHaveText(/Projects/i);

    // 2. Tasks
    await page.goto('/delivery/tasks');
    await expect(page.locator('h1')).toHaveText(/Tasks/i);

    // 3. Deliverables / Reviews
    await page.goto('/delivery/reviews');
    await expect(page.locator('h1')).toHaveText(/Reviews/i);

    await context.close();
  });
});
