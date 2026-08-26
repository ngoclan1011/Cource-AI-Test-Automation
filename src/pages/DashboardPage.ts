import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '@config/env';

/**
 * Admin dashboard, the landing page after a successful login.
 * The demo instance runs a Vietnamese locale, so assertions here rely on
 * structure (sidebar, profile menu, URL) rather than on translated labels.
 */
export class DashboardPage extends BasePage {
  readonly path = ROUTES.dashboard;

  readonly sidebar: Locator;
  readonly profileDropdown: Locator;
  readonly logoutLink: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.locator('#side-menu');
    this.profileDropdown = page.locator('.dropdown-toggle.profile').first();
    this.logoutLink = page.locator('a[href*="authentication/logout"]');
    this.searchInput = page.locator('#search, input[name="query"]').first();
  }

  /** True once the CRM shell has rendered for an authenticated user. */
  async isLoaded(): Promise<boolean> {
    return this.isVisible(this.sidebar, 15_000);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/?$/);
    await expect(this.sidebar).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.goto(ROUTES.logout);
  }
}
