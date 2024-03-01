import { E2ESelectors, Selectors, selectors } from '@grafana/e2e-selectors';
import { test, expect } from '@grafana/plugin-e2e';

test(`should have the following components:
  connection settings
  managed alerts
  scrape interval
  query timeout
  default editor
  disable metric lookup
  prometheus type
  cache level
  incremental querying
  disable recording rules
  custom query parameters
  http method
`, async ({
  createDataSourceConfigPage
}) => {
  const configPage = await createDataSourceConfigPage({type: "prometheus-amazon-datasource", deleteDataSourceAfterTest: true});
  
  // connection settings
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.connectionSettings)
    .isVisible();
  // managed alerts
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.manageAlerts)
    .isVisible();

  // scrape interval
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.scrapeInterval)
    .isVisible();


  // query timeout
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.queryTimeout)
    .isVisible();

  // default editor
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.defaultEditor)
    .isVisible();


  // disable metric lookup
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.disableMetricLookup)
    .isVisible();

  // prometheus type
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.prometheusType)
    .isVisible();


  // cache level
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.cacheLevel)
    .isVisible();

  // incremental querying
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.incrementalQuerying)
    .isVisible();

  // disable recording rules
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.disableRecordingRules)
    .isVisible();

  // custom query parameters
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.customQueryParameters)
    .isVisible();

  // http method
  await configPage
    .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.httpMethod)
    .isVisible();
});
