import { test, expect } from '@playwright/test';

test.describe('Admin Authentication & Smoke Test', () => {
  test('should redirect unauthenticated users to login, accept valid credentials, and load dashboard', async ({ page }) => {
    // 1. Visit the home page (unauthenticated)
    await page.goto('/');

    // 2. Expect to be redirected to the login page
    await expect(page).toHaveURL(/.*\/login/);

    // 3. Find the ID Number and Password inputs, then type credentials
    const idInput = page.locator('input[placeholder="ID Number"]');
    const passInput = page.locator('input[placeholder="••••••••••••"]');
    
    await idInput.fill('bb151120');
    await passInput.fill('bb1511200@');

    // 4. Click the INITIALIZE SESSION button
    const submitBtn = page.getByRole('button', { name: 'INITIALIZE SESSION' });
    await submitBtn.click();

    // 5. Expect to be redirected back to the home page (dashboard command center)
    await expect(page).toHaveURL('http://localhost:3030/');

    // 6. Verify command center elements are visible on the dashboard
    await expect(page.locator('h1')).toContainText(/command/i);
  });
});
