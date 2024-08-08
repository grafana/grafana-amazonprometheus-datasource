import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { test, expect } from '@grafana/plugin-e2e';
import { PromOptions } from '@grafana/prometheus';

/*test.describe('Prometheus variable query editor', () => {
  test.beforeEach('set query type', async ({
    readProvisionedDataSource,
    variableEditPage
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    
    await variableEditPage.setVariableType('Query');

    await variableEditPage.datasource.set(ds.name);

    await variableEditPage.getByGrafanaSelector(
      selectors.components.DataSource.Prometheus.variableQueryEditor.queryType
    ).focus();
    
    expect(await variableEditPage.getByGrafanaSelector(
      selectors.components.DataSource.Prometheus.variableQueryEditor.queryType)
    ).toBeVisible();

    await variableEditPage.getByGrafanaSelector(
      selectors.components.DataSource.Prometheus.variableQueryEditor.queryType
    ).click();
  });

  test('label names query variable', async ({
    page,
  }) => {
    await expect(page.getByText('Label names', { exact: true })).toBeVisible();

    await page.getByText('Label names', { exact: true }).click();

    await page.getByText('__name__').isVisible();

    await page.getByText('__name__').focus();

    await expect(page.getByText('__name__')).toBeVisible();
  });

  test('label values query variable', async ({
    variableEditPage,
    page,
  }) => {
    await page.getByText('Label values').click();

    const selector = 'data-testid label values label select';
    
    await page.getByTestId(selector).click();

    await page.getByText('__name__').isVisible();

    await page.getByText('__name__').focus();

    await page.getByText('__name__').click();

    await expect(variableEditPage
      .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)).toBeVisible();
    
    await expect(variableEditPage
      .getByGrafanaSelector(selectors.components.QueryBuilder.labelSelect)).toBeVisible();

    await expect(variableEditPage
      .getByGrafanaSelector(selectors.components.QueryBuilder.matchOperatorSelect)).toBeVisible();

    await expect(variableEditPage
      .getByGrafanaSelector(selectors.components.QueryBuilder.valueSelect)).toBeVisible();

    await expect(page.getByText('go_goroutines')).toBeVisible();
  });

  test('Metrics query variable', async ({
    variableEditPage,
    page,
  }) => {
    await page.getByText('Metrics').click();

    const selector = 'data-testid metric names metric regex';
    
    await expect(variableEditPage.getByGrafanaSelector(selector)).toBeVisible();

    await variableEditPage.getByGrafanaSelector(selector).fill('go_go');

    await variableEditPage.runQuery();

    await expect(page.getByText('go_goroutines')).toBeVisible();
  });

  test('Query result query variable', async ({
    variableEditPage,
    page,
  }) => {
    await page.getByText('Query result').click();

    const selector = 'data-testid variable query result';
    
    await expect(variableEditPage.getByGrafanaSelector(selector)).toBeVisible();

    await variableEditPage.getByGrafanaSelector(selector).fill('go_goroutines');

    await variableEditPage.getByGrafanaSelector(selector).blur();
    
    await page.getByText('go_goroutines{').focus();

    await expect(page.getByText('go_goroutines{')).toBeVisible();
  });

  test('Series query variable', async ({
    variableEditPage,
    page,
  }) => {
    await page.getByText('Series query').click();

    const selector = 'data-testid prometheus series query';

    await expect(variableEditPage.getByGrafanaSelector(selector)).toBeVisible();

    await variableEditPage.getByGrafanaSelector(selector).fill('go_goroutines');

    await variableEditPage.getByGrafanaSelector(selector).blur();
    
    await page.getByText('go_goroutines{').focus();

    await expect(page.getByText('go_goroutines{')).toBeVisible();
  });

  test('Classic query variable', async ({
    variableEditPage,
    page,
  }) => {
    await page.getByText('Classic query').click();

    const selector = 'data-testid prometheus classic query';

    await expect(variableEditPage.getByGrafanaSelector(selector)).toBeVisible();

    await variableEditPage.getByGrafanaSelector(selector).fill('label_names()');

    await variableEditPage.getByGrafanaSelector(selector).blur();
    
    await page.getByText('__name__').isVisible();

    await page.getByText('__name__').focus();

    await expect(page.getByText('__name__')).toBeVisible();
  });
});
*/
