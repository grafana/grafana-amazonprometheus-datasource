import { defineConfig } from '@playwright/test';

import baseConfig from './playwright.config';

// Used for fork PRs where Vault secrets are unavailable (isTrusted=false).
// Excludes tests tagged `@aws` that need the provisioned live AMP workspace.
export default defineConfig(baseConfig, {
  grepInvert: /@aws/,
});
