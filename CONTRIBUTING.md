## Getting started

### Backend

1. Update [Grafana plugin SDK for Go](https://grafana.com/docs/grafana/latest/developers/plugins/backend/grafana-plugin-sdk-for-go/) dependency to the latest minor version:

   ```bash
   go get -u github.com/grafana/grafana-plugin-sdk-go
   go mod tidy
   ```

2. Build backend plugin binaries for Linux, Windows and Darwin:

   ```bash
   mage -v
   ```

3. List all available Mage targets for additional commands:

   ```bash
   mage -l
   ```
### Frontend

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   yarn run dev
   ```

3. Build plugin in production mode

   ```bash
   yarn run build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes, requires git init first
   yarn run test

   # Exits after running all the tests
   yarn run test:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   yarn run server:configured
   ```

6. Run the E2E tests (using Playwright and @grafana/plugin-e2e)

   Smoke tests run against the local Prometheus in `docker-compose.yaml`. Tests tagged
   `@aws` exercise the AMP workspace provisioned for the Data Sources team's AWS test
   environment (Vault path `amazonManagedPrometheus`). In CI, Vault injects credentials
   into the provisioned datasource. Locally, export those credentials before starting
   Grafana if you want the live suite to run (otherwise `@aws` tests are skipped).

   ```bash
   # Install Playwright browsers
   yarn playwright install --with-deps

   # Optional — required for @aws / live AMP tests (otherwise they are skipped)
   export DS_INSTANCE_URL=<amp-workspace-url>
   export DS_INSTANCE_SIGV4_REGION=<region>
   export DS_INSTANCE_SIGV4_ACCESS_KEY=<access-key>
   export DS_INSTANCE_SIGV4_SECRET_KEY=<secret-key>

   # Spins up Grafana + a local Prometheus (defaults used when the env vars above are unset)
   yarn run server:configured

   # Starts the e2e tests
   yarn run e2e
   ```

   Fork PRs run `playwright.smoke.config.ts`, which excludes `@aws` tests because Vault
   secrets are unavailable to untrusted workflows.

7. Run the linter

   ```bash
   yarn run lint

   # or

   yarn run lint:fix
   ```

## Releasing

1. Update the version number in the `package.json` file.
2. Update the `CHANGELOG.md` with the changes contained in the release.
3. Make a PR for the changes.
4. Once merged, follow the release process in the Github Actions tab, instructions [here](https://enghub.grafana-ops.net/docs/default/component/grafana-plugins-platform/plugins-ci-github-actions/010-plugins-ci-github-actions/#cd_1)
