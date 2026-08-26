import { Page, Locator, expect } from '@playwright/test';
import { ENV } from '@config/env';
import { logger } from '@utils/logger';

/**
 * Shared behaviour for every page object: navigation, waiting and
 * small wrappers that keep the page objects readable.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /** Path this page lives at, relative to BASE_URL. */
  abstract readonly path: string;

  /**
   * Navigate to a route. The public demo instance occasionally stalls on a
   * request, so a slow load is retried instead of failing the whole test.
   */
  async goto(path: string = this.path, attempts = 3): Promise<void> {
    logger.step(`Navigate to ${ENV.baseURL}${path}`);
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        return;
      } catch (error) {
        lastError = error;
        logger.warn(`Navigation to ${path} timed out (attempt ${attempt}/${attempts}), retrying`);
      }
    }

    throw lastError;
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async waitForUrlContains(fragment: string, timeout = 15_000): Promise<void> {
    await this.page.waitForURL(new RegExp(escapeRegExp(fragment)), { timeout });
  }

  protected async type(locator: Locator, value: string, label: string): Promise<void> {
    logger.step(`Fill "${label}"`);
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  protected async click(locator: Locator, label: string): Promise<void> {
    logger.step(`Click "${label}"`);
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async isVisible(locator: Locator, timeout = 5_000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async expectVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message).toBeVisible();
  }

  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
