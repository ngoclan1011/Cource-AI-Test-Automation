import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '@config/env';
import { logger } from '@utils/logger';

export interface Credentials {
  email: string;
  password: string;
}

/**
 * Perfex CRM admin login screen.
 * Form: POST /admin/authentication with fields email / password / remember.
 * Validation and auth errors are rendered server-side as div.alert-danger
 * inside the form, so the page reloads on failure.
 */
export class LoginPage extends BasePage {
  readonly path = ROUTES.login;

  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly alerts: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form[action*="authentication"]');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.rememberMeCheckbox = page.locator('#remember');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.alerts = page.locator('.alert-danger');
    this.heading = page.getByRole('heading', { name: 'Login' });
  }

  async open(): Promise<this> {
    await this.goto();
    await this.expectLoaded();
    return this;
  }

  async expectLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async enterEmail(email: string): Promise<this> {
    await this.type(this.emailInput, email, 'Email Address');
    return this;
  }

  async enterPassword(password: string): Promise<this> {
    await this.type(this.passwordInput, password, 'Password');
    return this;
  }

  async checkRememberMe(check = true): Promise<this> {
    logger.step(`${check ? 'Check' : 'Uncheck'} "Remember me"`);
    await this.rememberMeCheckbox.setChecked(check);
    return this;
  }

  async submit(): Promise<void> {
    await expect(this.loginButton).toBeEnabled();
    await this.click(this.loginButton, 'Login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Fill the form and submit. Does not assert the outcome. */
  async login(credentials: Credentials, rememberMe = false): Promise<void> {
    logger.info(`Login attempt with "${credentials.email}"`);
    await this.enterEmail(credentials.email);
    await this.enterPassword(credentials.password);
    if (rememberMe) await this.checkRememberMe();
    await this.submit();
  }

  /** All error banners currently rendered on the form. */
  async errorMessages(): Promise<string[]> {
    if (!(await this.isVisible(this.alerts.first(), 5_000))) return [];
    return (await this.alerts.allInnerTexts()).map((text) => text.trim());
  }

  async expectErrorContaining(expected: string): Promise<void> {
    await expect(this.alerts.filter({ hasText: expected }).first()).toBeVisible();
  }

  async expectStillOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp('/admin/authentication'));
    await expect(this.loginButton).toBeVisible();
  }

  /** Password must never be echoed back to the screen. */
  async expectPasswordMasked(): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
  }

  /**
   * The email field is type="email", so the browser blocks submission on a
   * malformed address before the request ever reaches the server.
   */
  async isEmailFieldValid(): Promise<boolean> {
    return this.emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
  }
}
