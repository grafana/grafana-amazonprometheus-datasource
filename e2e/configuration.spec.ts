import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { test, expect } from '@grafana/plugin-e2e';
import { PromOptions } from '@grafana/prometheus';

const DATA_SOURCE_NAME = 'prometheus-config';

test.describe('Configuration tests', () => {
  test(`should have the following components:
    connection settings
    managed alerts
    scrape interval
    query timeout
    default editor
    disable metric lookup
    cache level
    incremental querying
    disable recording rules
    custom query parameters
    http method
  `, async ({ createDataSourceConfigPage, readProvisionedDataSource, page }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
      fileName: 'datasources.yml',
    });
    const configPage = await createDataSourceConfigPage({ type: ds.type });

    // connection settings
    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.connectionSettings)
    ).toBeVisible();

    // managed alerts
    await expect(page.locator(`#${selectors.components.DataSource.Prometheus.configPage.manageAlerts}`)).toBeVisible();

    // scrape interval
    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.scrapeInterval)
    ).toBeVisible();

    // query timeout
    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.queryTimeout)
    ).toBeVisible();

    // default editor
    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.defaultEditor)
    ).toBeVisible();

    // disable metric lookup
    await expect(
      page.locator(`#${selectors.components.DataSource.Prometheus.configPage.disableMetricLookup}`)
    ).toBeVisible();

    // cache level
    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.cacheLevel)
    ).toBeVisible();

    // incremental querying
    await expect(
      page.locator(`#${selectors.components.DataSource.Prometheus.configPage.incrementalQuerying}`)
    ).toBeVisible();

    // disable recording rules
    await expect(
      page.locator(`#${selectors.components.DataSource.Prometheus.configPage.disableRecordingRules}`)
    ).toBeVisible();

    // custom query parameters
    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.customQueryParameters)
    ).toBeVisible();

    // http method
    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.httpMethod)
    ).toBeVisible();
  });

  test('it should hide prometheus type and version settings', async ({ createDataSourceConfigPage }) => {
    const configPage = await createDataSourceConfigPage({
      type: 'grafana-amazonprometheus-datasource',
      name: DATA_SOURCE_NAME,
    });

    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.prometheusType)
    ).toHaveCount(0);

    await expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.prometheusVersion)
    ).toHaveCount(0);
  });

  /*  test('"Save & test" should be successful when configuration is valid', async ({
    createDataSourceConfigPage,
    readProvisionedDataSource,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    const configPage = await createDataSourceConfigPage({ type: ds.type });

    await configPage
      .getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.connectionSettings)
      .fill(ds.url || '');

    await expect(configPage.saveAndTest()).toBeOK();
  });
*/

  test('"Save & test" should fail when configuration is invalid', async ({
    readProvisionedDataSource,
    gotoDataSourceConfigPage,
    page,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
      fileName: 'datasources.yml',
    });
    const configPage = await gotoDataSourceConfigPage(ds.uid);
    await page.getByLabel('Edit Access Key ID').click();
    await page.getByLabel('Access Key ID').fill('');
    await expect(configPage.saveAndTest()).not.toBeOK();
    await expect(configPage).toHaveAlert('error', {
      hasText: /.*there was an error returned querying the prometheus api/i,
    });
  });

  test('"Save & test" should fail when url is empty', async ({
    createDataSourceConfigPage,
    readProvisionedDataSource,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
      fileName: 'datasources.yml',
    });
    const configPage = await createDataSourceConfigPage({ type: ds.type });
    await configPage.getByGrafanaSelector(selectors.pages.DataSource.saveAndTest).click();
    await expect(configPage).toHaveAlert('error', { hasText: /invalid URL/i });
  });

  test('it should allow a user to select a query overlap window when incremental querying is selected', async ({
    createDataSourceConfigPage,
    page,
  }) => {
    const configPage = await createDataSourceConfigPage({
      type: 'grafana-amazonprometheus-datasource',
      name: DATA_SOURCE_NAME + 'check',
    });

    await page
      .locator(`#${selectors.components.DataSource.Prometheus.configPage.incrementalQuerying}`)
      .setChecked(true, { force: true });

    expect(
      configPage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.queryOverlapWindow)
    ).toBeVisible();
  });

  // exemplars tested in exemplar.spec
});
