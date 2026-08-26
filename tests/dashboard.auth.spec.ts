import { test, expect } from '@playwright/test';
import { DashboardPage } from '@pages/DashboardPage';
import { ROUTES } from '@config/env';

/**
 * Runs in the "authenticated" project: the session comes from .auth/admin.json,
 * so these tests never touch the login form.
 */
test.describe('Authenticated session', () => {
  test('the saved session opens the dashboard directly @smoke', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.expectLoaded();
  });

  test('logging out sends the user back to the login page @regression', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.expectLoaded();

    await dashboard.logout();

    await expect(page).toHaveURL(new RegExp(ROUTES.login));
    await expect(page.locator('#email')).toBeVisible();
  });
});
