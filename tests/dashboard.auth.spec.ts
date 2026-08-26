import { test } from '@playwright/test';
import { DashboardPage } from '@pages/DashboardPage';

/**
 * Runs in the "authenticated" project: the session comes from .auth/admin.json,
 * so these tests never touch the login form.
 *
 * Nothing here may log out — the saved session is shared by every test in this
 * project, and destroying it server-side would break the others. Logout is
 * covered by TC_LOGIN_15, which opens its own session.
 */
test.describe('Authenticated session', () => {
  test('the saved session opens the dashboard directly @smoke', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.expectLoaded();
  });

  test('the saved session survives a reload @regression', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await page.reload({ waitUntil: 'domcontentloaded' });

    await dashboard.expectLoaded();
  });
});
