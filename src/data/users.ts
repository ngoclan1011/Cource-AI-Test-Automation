import { ENV } from '@config/env';
import type { Credentials } from '@pages/LoginPage';

export const VALID_ADMIN: Credentials = {
  get email() {
    return ENV.admin.email;
  },
  get password() {
    return ENV.admin.password;
  },
};

/** Error strings returned by Perfex CRM's server-side validation. */
export const ERRORS = {
  invalidCredentials: 'Invalid email or password',
  emailRequired: 'The Email Address field is required',
  passwordRequired: 'The Password field is required',
} as const;

/** Payload dung de kiem tra rang buoc dinh dang email phia client. */
export const MALFORMED_EMAIL = "admin@example.com' OR '1'='1";

export interface NegativeLoginCase {
  id: string;
  title: string;
  email: string;
  password: string;
  expectedError: string;
}

/** Negative data set driving the data-driven login suite. */
export const NEGATIVE_LOGIN_CASES: NegativeLoginCase[] = [
  {
    id: 'TC_LOGIN_04',
    title: 'Valid email + wrong password',
    email: 'admin@example.com',
    password: 'WrongPassword!123',
    expectedError: ERRORS.invalidCredentials,
  },
  {
    id: 'TC_LOGIN_05',
    title: 'Unregistered email + valid password',
    email: 'not-a-user@example.com',
    password: '123456',
    expectedError: ERRORS.invalidCredentials,
  },
  {
    id: 'TC_LOGIN_06',
    title: 'Empty email, password filled',
    email: '',
    password: '123456',
    expectedError: ERRORS.emailRequired,
  },
  {
    id: 'TC_LOGIN_07',
    title: 'Email filled, empty password',
    email: 'admin@example.com',
    password: '',
    expectedError: ERRORS.passwordRequired,
  },
  {
    id: 'TC_LOGIN_08',
    title: 'Both fields empty',
    email: '',
    password: '',
    expectedError: ERRORS.emailRequired,
  },
  {
    id: 'TC_LOGIN_09',
    title: 'Credentials are case-sensitive on the password',
    email: 'admin@example.com',
    password: '123456 ',
    expectedError: ERRORS.invalidCredentials,
  },
  {
    id: 'TC_LOGIN_10',
    title: 'SQL-injection payload in the password is rejected',
    email: 'admin@example.com',
    password: "' OR '1'='1",
    expectedError: ERRORS.invalidCredentials,
  },
];
