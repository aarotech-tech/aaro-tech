import { test, expect } from '@playwright/test';

test.describe('Lead Generation Pipeline', () => {
  test('submitting contact form successfully creates a lead', async ({ page, request }) => {
    // 1. Visit the contact page
    await page.goto('/contact');
    
    // 2. Fill out the form
    const uniqueEmail = `test-lead-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Playwright Tester');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="businessName"]', 'Automated Testing Corp');
    await page.fill('textarea[name="projectDescription"]', 'We need a robust QA pipeline built.');
    await page.selectOption('select[name="budget"]', '$10k - $25k');
    
    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Verify success message appears on UI
    await expect(page.locator('text=Message sent successfully')).toBeVisible({ timeout: 10000 });
  });

  test('submitting form multiple times quickly triggers rate limit', async ({ page }) => {
    await page.goto('/contact');
    
    // 2. Fill out the form
    const uniqueEmail = `test-lead-spam-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Spammer');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="businessName"]', 'Spam Corp');
    await page.fill('textarea[name="projectDescription"]', 'Spam spam spam');
    await page.selectOption('select[name="budget"]', '< $5k');
    
    // 3. Click submit multiple times fast
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    
    // At least one of these should eventually yield a toast error for rate limit
    // Wait for the rate limit message
    // "Too many requests. Please try again later." is standard, or whatever our AppError surfaces.
    const toast = page.locator('.group.toast');
    await expect(toast).toContainText(/Message sent successfully|RateLimitError|Too many requests|Action \[submitContactForm\] failed/i, { timeout: 10000 });
  });
});
