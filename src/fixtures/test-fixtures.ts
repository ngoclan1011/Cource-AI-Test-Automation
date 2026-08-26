import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { VALID_ADMIN } from '@data/users';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  /** A dashboard reached by actually logging in through the UI. */
  loggedInDashboard: DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  loggedInDashboard: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(VALID_ADMIN);

    const dashboard = new DashboardPage(page);
    await dashboard.expectLoaded();
    await use(dashboard);
  },
});

export { expect };
