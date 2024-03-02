import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { E2ESelectors, Selectors, selectors } from '@grafana/e2e-selectors';
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
    prometheus type
    cache level
    incremental querying
    disable recording rules
    custom query parameters
    http method
  `, async ({
    createDataSourceConfigPage,
    readProvisionedDataSource,
    page,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    const configPage = await createDataSourceConfigPage({type: ds.type, deleteDataSourceAfterTest: true});
    
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
    await page.locator(`#${selectors.components.DataSource.Prometheus.configPage.incrementalQuerying}`)
      .isVisible();

    // disable recording rules
    await page.locator(`#${selectors.components.DataSource.Prometheus.configPage.disableRecordingRules}`)
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

  test('"Save & test" should be successful when configuration is valid', async ({
    createDataSourceConfigPage,
    readProvisionedDataSource,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    const configPage = await createDataSourceConfigPage({ type: ds.type, deleteDataSourceAfterTest: true, });
    
    await configPage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.connectionSettings)
      .fill(ds.url || '');

    await expect(configPage.saveAndTest()).toBeOK();
  });

  test('"Save & test" should fail when configuration is invalid', async ({
    createDataSourceConfigPage,
    readProvisionedDataSource,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    const configPage = await createDataSourceConfigPage({ type: ds.type, deleteDataSourceAfterTest: true, });
    await expect(configPage.saveAndTest()).not.toBeOK();
    const alertMessage = await configPage.getByTestIdOrAriaLabel('data-testid Alert error').textContent();
    await expect(alertMessage).toContain('empty url')
  });

  test('it should allow a user to add the version when the Prom type is selected', 
  async ({
    createDataSourceConfigPage,
    readProvisionedDataSource,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    
    const configPage = await createDataSourceConfigPage({
      type: "prometheus-amazon-datasource", 
      name: DATA_SOURCE_NAME,
      deleteDataSourceAfterTest: true,
    });
    
    await configPage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.prometheusType)
      .isVisible();

    await configPage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.prometheusVersion)
      .isVisible();
  });

  test('it should allow a user to select a query overlap window when incremental querying is selected', 
  async ({
    createDataSourceConfigPage,
    readProvisionedDataSource,
    page,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    
    const configPage = await createDataSourceConfigPage({
      type: "prometheus-amazon-datasource", 
      name: DATA_SOURCE_NAME,
      deleteDataSourceAfterTest: true,
    });
      
    await page.locator(`#${selectors.components.DataSource.Prometheus.configPage.incrementalQuerying}`)
      .isVisible();

    await configPage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.configPage.queryOverlapWindow)
      .isVisible();
  });

// exemplars tested in exemplar.spec
});

