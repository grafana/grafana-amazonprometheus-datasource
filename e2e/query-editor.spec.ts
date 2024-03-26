import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { test, expect } from '@grafana/plugin-e2e';
import { PromOptions } from '@grafana/prometheus';
import { chromium } from '@playwright/test';

const codeEditorProvFile = 'code-editor.yml';

const metric = 'process_cpu_seconds_total';

test.describe('Prometheus query editor', () => {
  test(`should have the following components:
    kickstart component
    explain
    editor toggle
    options 
    legend
    format
    step
    type
    exemplars
  `, async ({
    readProvisionedDataSource,
    explorePage,
    page,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    
    await explorePage.goto();

    await explorePage.datasource.set(ds.name);
    // query patterns
    await expect(explorePage
      .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.queryPatterns+"break on purpose")).toBeVisible();
    
    // explain
    await expect(explorePage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.explain)).toBeVisible();
      
    // editor toggle
    await expect(explorePage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.editorToggle)).toBeVisible();

    // options
    await expect(explorePage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.options)).toBeVisible();
    
    // open the options
    await explorePage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.options)
      .click();

    // legend
    await expect(explorePage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.legend)).toBeVisible();
    
    // format
    await expect(explorePage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.format)).toBeVisible();
    
    // step
    await expect(page.locator(`#${selectors.components.DataSource.Prometheus.queryEditor.step}`)).toBeVisible();

    // type
    await expect(explorePage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.type)).toBeVisible();

    // exemplars
    await expect(page.locator(`#${selectors.components.DataSource.Prometheus.queryEditor.exemplars}`)).toBeVisible();
  });

  test.describe('Code editor', () => {
    test('it navigates to the code editor with editor type as code', async ({
      readProvisionedDataSource,
      explorePage
    }) => {
      const dsCodeEditor = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: codeEditorProvFile });

      await explorePage.goto();

      await explorePage.datasource.set(dsCodeEditor.name);

      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)).toBeVisible();
    });
    
    test('it navigates to the code editor and opens the metrics browser with metric search, labels, label values, and all components', async ({
      readProvisionedDataSource,
      explorePage
    }) => {      
      const dsCodeEditor = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: codeEditorProvFile });

      await explorePage.goto();

      await explorePage.datasource.set(dsCodeEditor.name);

      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)).toBeVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField).focus();
      
      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)).toBeVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton).focus();
      
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton).isEnabled();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .click()
        
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.selectMetric).isVisible();
      
      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.selectMetric)).toBeVisible();  

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.labelNamesFilter).isVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.labelValuesFilter).isVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.useQuery).isVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.useAsRateQuery).isVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.validateSelector).isVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.clear).isVisible();
    });

    test('selects a metric in the metrics browser and uses the query', async ({
      readProvisionedDataSource,
      explorePage,
      page
    }) => {
      const dsCodeEditor = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: codeEditorProvFile });

      await explorePage.goto();
      
      await explorePage.datasource.set(dsCodeEditor.name);

      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)).toBeVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField).focus();

      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)).toBeVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton).focus();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton).isEnabled();
        
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .click()
        
      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.selectMetric)).toBeVisible();

      await page.getByRole('option', { name: 'go_gc_duration_seconds', exact: true }).click()
      
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.useQuery).click();

      const testMetric = await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField).textContent()

      expect(testMetric).toContain('go_gc_duration_seconds');
    });
  });

  test.describe('Query builder', () => {
    test('it navigates to the query builder with default editor type as builder', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      const dsDefaultEditorBuilder = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

      await explorePage.goto();

      // await explorePage.datasource.set(dsDefaultEditorBuilder.name);

      await page.getByTestId('data-testid Select a data source').click();

      await page.getByTestId('data-testid Select a data source').fill('Prometheus-amazon');

      await page.getByRole('button', { name: 'Prometheus-amazon Prometheus' }).click();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).focus();
      
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isEnabled();

      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)).toBeVisible();
    });

    test('the query builder contains metric select, label filters and operations', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      const dsDefaultEditorBuilder = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

      await explorePage.goto();

      // await explorePage.datasource.set(dsDefaultEditorBuilder.name);

      await page.getByTestId('data-testid Select a data source').click();

      await page.getByTestId('data-testid Select a data source').fill('Prometheus-amazon');

      await page.getByRole('button', { name: 'Prometheus-amazon Prometheus' }).click();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isEnabled();

      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)).toBeVisible();
      
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).focus();

      await expect(explorePage
          .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.labelSelect)).toBeVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.labelSelect).focus();  

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.matchOperatorSelect).focus();  

      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.matchOperatorSelect)).toBeVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.valueSelect).focus();  
      
      await expect(explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.valueSelect)).toBeVisible();
    });

    test('it can select a metric and provide a hint', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      const dsDefaultEditorBuilder = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

      await explorePage.goto();

      // await explorePage.datasource.set(dsDefaultEditorBuilder.name);

      await page.getByTestId('data-testid Select a data source').click();

      await page.getByTestId('data-testid Select a data source').fill('Prometheus-amazon');

      await page.getByRole('button', { name: 'Prometheus-amazon Prometheus' }).click();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isVisible();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isEnabled();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).focus();

      await explorePage.getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).click()

      await page.getByText(metric, { exact: true }).click();

      const hintText = await explorePage.getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.hints).textContent();

      expect(hintText).toContain('hint: add rate');
    });

    test('it can select a label filter and run a query', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      const dsDefaultEditorBuilder = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

      await explorePage.goto();

      // await explorePage.datasource.set(dsDefaultEditorBuilder.name);

      await page.getByTestId('data-testid Select a data source').click();

      await page.getByTestId('data-testid Select a data source').fill('Prometheus-amazon');

      await page.getByRole('button', { name: 'Prometheus-amazon Prometheus' }).click();
      
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.labelSelect).isVisible();
      
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.labelSelect).isEnabled();  

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.QueryBuilder.labelSelect).focus();  
        
      await explorePage.getByTestIdOrAriaLabel(selectors.components.QueryBuilder.labelSelect).click()

      await page.getByText('__name__', { exact: true }).click();

      await explorePage.getByTestIdOrAriaLabel(selectors.components.QueryBuilder.valueSelect).click();

      await page.getByText(metric, { exact: true }).click();

      await explorePage.runQuery();
    });

    test('it should have the metrics explorer opened via the metric select', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      const dsDefaultEditorBuilder = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

      await explorePage.goto();

      // await explorePage.datasource.set(dsDefaultEditorBuilder.name);

      await page.getByTestId('data-testid Select a data source').click();

      await page.getByTestId('data-testid Select a data source').fill('Prometheus-amazon');

      await page.getByRole('button', { name: 'Prometheus-amazon Prometheus' }).click();

      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isVisible();

        await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isEnabled();
      
      await explorePage
        .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).focus();

      await explorePage.getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).click();

      await page.getByText('Metrics explorer', { exact: true }).click();

      await expect(explorePage.getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.builder.metricsExplorer)).toBeVisible();
    });

    // NEED TO COMPLETE QUEY ADVISOR WORK OR FIGURE OUT HOW TO ENABLE EXPERIMENTAL FEATURE TOGGLES
    // it('should have a query advisor when enabled with feature toggle', () => {
    //   cy.window().then((win) => {
    //     win.localStorage.setItem('grafana.featureToggles', 'prometheusPromQAIL=0');

    //     navigateToEditor('Builder', 'prometheusBuilder');

    //     getResources();

    //     e2e.components.DataSource.Prometheus.queryEditor.builder.queryAdvisor().should('exist');
    //   });
    // });
  });
});
