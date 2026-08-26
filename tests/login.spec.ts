import { test, expect } from '@fixtures/test-fixtures';
import { VALID_ADMIN, ERRORS, NEGATIVE_LOGIN_CASES, MALFORMED_EMAIL } from '@data/users';
import { ROUTES } from '@config/env';

test.describe('Perfex CRM - Admin login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('TC_LOGIN_01 - the login form renders all of its controls @smoke', async ({ loginPage }) => {
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
    await expect(loginPage.passwordInput).toBeVisible();
    await loginPage.expectPasswordMasked();
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
    await expect(loginPage.loginButton).toBeEnabled();
    await expect(loginPage.forgotPasswordLink).toHaveAttribute(
      'href',
      new RegExp('forgot_password'),
    );
  });

  test('TC_LOGIN_02 - valid credentials land on the dashboard @smoke @regression', async ({
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.login(VALID_ADMIN);

    await dashboardPage.expectLoaded();
    expect(await dashboardPage.isLoaded()).toBe(true);
    await expect(loginPage.loginButton).toHaveCount(0);
  });

  test('TC_LOGIN_03 - "Remember me" login also succeeds @regression', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    await loginPage.login(VALID_ADMIN, true);

    await dashboardPage.expectLoaded();
    const cookies = await page.context().cookies();
    expect(cookies.length, 'a session cookie is issued').toBeGreaterThan(0);
  });

  // Data-driven negative cases.
  for (const testCase of NEGATIVE_LOGIN_CASES) {
    test(`${testCase.id} - ${testCase.title} @regression`, async ({ loginPage }) => {
      await loginPage.login({ email: testCase.email, password: testCase.password });

      await loginPage.expectStillOnLoginPage();
      await loginPage.expectErrorContaining(testCase.expectedError);
    });
  }

  test('TC_LOGIN_10b - a malformed email is blocked before the request is sent @regression', async ({
    loginPage,
  }) => {
    await loginPage.enterEmail(MALFORMED_EMAIL);
    await loginPage.enterPassword('123456');
    await loginPage.loginButton.click();

    // type="email" fails constraint validation, so the form never submits.
    expect(await loginPage.isEmailFieldValid()).toBe(false);
    await loginPage.expectStillOnLoginPage();
    await expect(loginPage.alerts).toHaveCount(0);
  });

  test('TC_LOGIN_11 - the error message does not leak which field was wrong @regression', async ({
    loginPage,
  }) => {
    await loginPage.login({ email: 'nobody@example.com', password: 'whatever123' });
    const messages = await loginPage.errorMessages();

    expect(messages.join(' ')).toContain(ERRORS.invalidCredentials);
    expect(messages.join(' ')).not.toMatch(/user (does )?not (exist|found)/i);
  });

  test('TC_LOGIN_12 - the password is never echoed back after a failed attempt @regression', async ({
    loginPage,
  }) => {
    await loginPage.login({ email: VALID_ADMIN.email, password: 'WrongPassword!123' });

    await loginPage.expectErrorContaining(ERRORS.invalidCredentials);
    await loginPage.expectPasswordMasked();
    await expect(loginPage.passwordInput).toHaveValue('');
  });

  test('TC_LOGIN_13 - "Forgot Password?" opens the recovery page @regression', async ({
    loginPage,
    page,
  }) => {
    await loginPage.forgotPasswordLink.click();

    await expect(page).toHaveURL(new RegExp('forgot_password'));
  });

  test('TC_LOGIN_14 - the dashboard is not reachable without a session @regression', async ({
    page,
    loginPage,
  }) => {
    await page.goto(ROUTES.dashboard);

    await loginPage.expectStillOnLoginPage();
  });
});

test.describe('Perfex CRM - Logout', () => {
  test('TC_LOGIN_15 - logging out returns the user to the login page @regression', async ({
    loggedInDashboard,
    loginPage,
  }) => {
    await loggedInDashboard.logout();

    await loginPage.expectStillOnLoginPage();
  });

  test('TC_LOGIN_16 - the dashboard is unreachable after logging out @regression', async ({
    loggedInDashboard,
    loginPage,
    page,
  }) => {
    await loggedInDashboard.logout();
    await page.goto(ROUTES.dashboard);

    await loginPage.expectStillOnLoginPage();
  });
});
