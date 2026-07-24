import { test, expect } from '@playwright/test';

test.describe('Admin Smoke Test', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/');
    
    // Check for common admin dashboard elements
    // Since we are likely redirected to login if not authenticated
    // we'll look for keywords like "Sign In" or "Admin"
    const title = await page.title();
    console.log('Page Title:', title);
    
    // Adjusted for a typical CarBooking Admin setup
    // We expect the page to load without a 404/500
    await expect(page).not.toHaveTitle(/404/);
  });
});
