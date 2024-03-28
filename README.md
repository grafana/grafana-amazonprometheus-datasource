# Prometheus Amazon Data Source

This data source plugin is is for Amazon Prometheus. It has all the features of the Grafana core Prometheus plugin with Amazon specific authentication in the configuration page.

Amazon Managed Service for Prometheus is a Prometheus-compatible service that monitors and provides alerts on containerized applications and infrastructure at scale.

Read more about it here:

[https://aws.amazon.com/prometheus/](https://aws.amazon.com/prometheus/)

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
   yarn run server
   ```

6. Run the E2E tests (using Playwright and @grafana/plugin-e2e)

   ```bash
   # Spins up a Grafana docker instance (port 3000) with an actual Prometheus instance (port 9090)
   yarn run server

   # Starts the e2e tests
   yarn run e2e
   ```

7. Run the linter

   ```bash
   yarn run lint

   # or

   yarn run lint:fix
   ```
