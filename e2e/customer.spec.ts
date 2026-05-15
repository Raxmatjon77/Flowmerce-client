// NOTE: Requires backend running on localhost:3000 and Vite dev server on 5173
// Start backend:  cd Flowmerce && npm run start:dev
// Start client:   cd Flowmerce-client && npm run dev
// Run tests:      cd Flowmerce-client && npx playwright test

import { test, expect, Page } from '@playwright/test';

// Each test run generates a unique user so repeated runs never collide
const RUN_ID = Date.now();
const TEST_USER_ID = `pw-user-${RUN_ID}`;
const TEST_EMAIL = `playwright-${RUN_ID}@test.com`;
const TEST_NAME = 'Playwright User';
const TEST_PASSWORD = 'testpassword123';

// ---------------------------------------------------------------------------
// Helper: log in via the UI and assert redirect to dashboard
// ---------------------------------------------------------------------------
async function loginViaUi(page: Page, userId: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.locator('#userId').fill(userId);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/', { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
test.describe('Customer flow', () => {
  test('register a new user and land on dashboard', async ({ page }) => {
    await page.goto('/register');

    // Form fields — real IDs from Register.tsx
    await page.locator('#userId').fill(TEST_USER_ID);
    await page.locator('#email').fill(TEST_EMAIL);
    await page.locator('#name').fill(TEST_NAME);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page.locator('#confirmPassword').fill(TEST_PASSWORD);

    // Submit button text from Register.tsx: "Create account"
    await page.getByRole('button', { name: /create account/i }).click();

    // After register the app navigates to "/"
    await expect(page).toHaveURL('/', { timeout: 15_000 });
  });

  test('login with registered credentials and land on dashboard', async ({ page }) => {
    await loginViaUi(page, TEST_USER_ID, TEST_PASSWORD);
  });

  test('wrong password shows an error message and stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#userId').fill(TEST_USER_ID);
    await page.locator('#password').fill('totally-wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();

    // The Login component renders the error in the AlertCircle block
    await expect(page.getByText(/login failed|invalid credentials|incorrect/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL('/login');
  });

  test('browse /shop shows inventory items', async ({ page }) => {
    await loginViaUi(page, TEST_USER_ID, TEST_PASSWORD);

    await page.goto('/shop');

    // At least one row or card should appear (seeded inventory)
    const items = page.locator('table tbody tr, [data-testid="inventory-item"]');
    await expect(items.first()).toBeVisible({ timeout: 15_000 });
  });

  test('/orders page loads and shows the orders list', async ({ page }) => {
    await loginViaUi(page, TEST_USER_ID, TEST_PASSWORD);

    await page.goto('/orders');

    // The page should not error — check for a known heading or table/list element
    await expect(
      page.locator('table, [data-testid="orders-list"], h1, h2').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    // Clear any stored token by going directly to a protected route
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
