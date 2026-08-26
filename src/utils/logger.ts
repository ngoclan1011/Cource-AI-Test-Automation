/* Minimal step logger — output lands in the Playwright report and the console. */
type Level = 'INFO' | 'STEP' | 'WARN' | 'ERROR';

function write(level: Level, message: string): void {
  const stamp = new Date().toISOString().substring(11, 23);
  // eslint-disable-next-line no-console
  console.log(`[${stamp}] [${level}] ${message}`);
}

export const logger = {
  info: (message: string) => write('INFO', message),
  step: (message: string) => write('STEP', `→ ${message}`),
  warn: (message: string) => write('WARN', message),
  error: (message: string) => write('ERROR', message),
};
