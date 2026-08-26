import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { VALID_ADMIN } from '@data/users';
import { STORAGE_STATE } from '@config/env';

/**
 * Runs once before the "authenticated" project and persists the admin session
 * to .auth/admin.json so downstream specs skip the login UI.
 */
setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(VALID_ADMIN);

  const dashboard = new DashboardPage(page);
  await dashboard.expectLoaded();

  await page.context().storageState({ path: STORAGE_STATE });
  expect(await dashboard.isLoaded()).toBe(true);
});
