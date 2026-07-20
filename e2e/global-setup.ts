import { FullConfig } from '@playwright/test';

// Auth setup is skipped — admin uses Google OAuth which cannot be automated.
// Auth-dependent tests are marked test.skip() and must be verified manually.
async function globalSetup(config: FullConfig) {
  console.log('ℹ️  Auth setup skipped (Google OAuth). Auth-required tests will be skipped automatically.');
}

export default globalSetup;

