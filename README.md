# Amazon Managed Service for Prometheus Data Source

This data source plugin is for the Amazon Managed Service for Prometheus. It has all the features of the Grafana core Prometheus plugin with Amazon specific authentication in the configuration page.

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
   yarn run server:configured
   ```

6. Run the E2E tests (using Playwright and @grafana/plugin-e2e)

   ```bash
   # Spins up a Grafana docker instance (v11.0.0) (port 3000) with an actual Prometheus instance (port 9090)
   yarn run server:configured

   # Starts the e2e tests
   yarn run e2e
   ```

7. Run the linter

   ```bash
   yarn run lint

   # or

   yarn run lint:fix
   ```

## Migrate from core Prometheus to Amazon Managed Service for Prometheus

If you are using core Prometheus with SigV4 authentication, you will want to migrate to the Amazon Managed Service for Prometheus data source as SigV4 auth is deprecated in core Prometheus. This is a summary of the steps required to migrated from using core Prometheus to Amazon Managed Service for Prometheus.

- Get the `UID` for Prometheus using SigV4
- Get the `UID` for your new Amazon Managed Service for Prometheus
- Update dashboards with the new datasource `UID`
- Update alert rules by exporting provisioning files and updating the data source in the model or create new alert rules.
- Recreate correlations.
- Recreate recorded queries

#### How to migrate

1. Get the UID for the old and new data source
    - Navigate to the configuration page for your new data source.
    - Find the `UID` in the url.
      - Example: “connections/datasources/edit/<DATA SOURCE UID>”
    - Copy the UID for both the old and new data sources.
      - <Prom SigV4 UID>
      - <AMP UID>

2. Dashboard migration
    - Navigate to the dashboard JSON panel of your dashboard that uses the old Prometheus with SigV4 authentication.
    - Click on Dashboard settings.
    - Select the JSON model in the tabs.
    - Search for the <Prom SigV4 UID>
      - Example: `"uid": "<Prom SigV4 UID>"`
      - Change both the `UID` and the `type`
      - The old type is `prometheus`
      - Example for changing `type` and `UID`
      ```
        "type": "prometheus",
        "uid": "<Prom SigV4 UID>"

        // can be change to

        "type": "grafana-amazonprometheus-datasource",
        "uid": "<AMP UID>"
      ```
    - Confirm the "datasource" change for all of the following categories in the JSON model.
      - `annotations`
      - `panels`
      - `targets`
      - `templating`
    - Click “Save changes” in the bottom left side of the JSON model UI.
  Save your dashboard.

2. Alert rules migration
    - Alert rule data sources cannot be changed without wiping out the query.
    - There are two ways to migrate alert rules
      - First, edit the rule by exporting to a provisioned file [documentation here].
        - Navigate to the Alert rules page.
        - Identify the alert rule that uses the Prom SigV4 data source.
        - Select “Export rule.”
        - Export the rule in your choice of JSON, YAML or Terraform.
        - Search the exported rule for the <Prom SigV4 UID>.
        - Change the `UID` and the `type` in the exported rule.
      ```
        "type": "prometheus",
        "uid": "<Prom SigV4 UID>"

        // can be change to

        "type": "grafana-amazonprometheus-datasource",
        "uid": "<AMP UID>"
      ```
        - Rename the rule and update the `name` field in the exported rule.
        - Delete the old rule.
      - OR second, Create a new new alert rule [documentation here](https://grafana.com/tutorials/alerting-get-started/).
        - Copy the fields from the Prom SigV4 rule.
        - Create a new alert rule and select your AMP data source.
        - Add the fields from the old rule to the new rule.
        - Delete the old rule.

3. Correlations migration
    - Create a new correlation, see [documentation here](https://grafana.com/docs/grafana/latest/administration/correlations/create-a-new-correlation/).
    - Identify the correlation that uses the old Prom SigV4 data source.
    - Copy the fields from your correlation.
    - Create a brand new correlation using the new AMP data source.
    - Add the fields from the old correlation to the new correlation.
    - Delete the old correlation.

4. Recorded queries migration
    - Only available in Grafana Enterprise and Grafana Cloud
    - Create a new recorded query, see [documentation here](https://grafana.com/docs/grafana/latest/administration/correlations/create-a-new-correlation/).
    - Identify the recorded query that uses the old Prom SigV4 data source.
    - Copy the fields from your recorded query.
    - Create a brand new recorded query using the new AMP data source.
    - Add the fields from the old recorded query to the new recorded query.
    - Delete the old recorded query.
