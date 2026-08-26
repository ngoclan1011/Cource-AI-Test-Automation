import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Read a required env var, failing fast with a clear message. */
function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing environment variable "${key}". Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function num(key: string, fallback: number): number {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  return value === undefined ? fallback : value.toLowerCase() === 'true';
}

export const ENV = {
  baseURL: process.env.BASE_URL ?? 'https://crm.anhtester.com',

  admin: {
    get email(): string {
      return required('ADMIN_EMAIL');
    },
    get password(): string {
      return required('ADMIN_PASSWORD');
    },
  },

  headless: bool('HEADLESS', true),
  slowMo: num('SLOW_MO', 0),
  timeout: num('TIMEOUT', 120_000),
  retries: num('RETRIES', process.env.CI ? 2 : 0),
  workers: num('WORKERS', 4),
  isCI: !!process.env.CI,
} as const;

/** Application routes, relative to BASE_URL. */
export const ROUTES = {
  login: '/admin/authentication',
  forgotPassword: '/admin/authentication/forgot_password',
  logout: '/admin/authentication/logout',
  dashboard: '/admin/',
} as const;

/** Storage state file holding the logged-in session for reuse across tests. */
export const STORAGE_STATE = path.resolve(__dirname, '../../.auth/admin.json');
