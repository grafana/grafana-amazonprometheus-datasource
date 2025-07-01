import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { test, expect } from '@grafana/plugin-e2e';
import { PromOptions } from '@grafana/prometheus';
import semver from 'semver';
const codeEditorProvFile = 'code-editor.yml';

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
  `, async ({ readProvisionedDataSource, explorePage, grafanaVersion, page }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
      fileName: 'datasources.yml',
    });

    await explorePage.goto();

    await explorePage.datasource.set(ds.name);
    // query patterns
    await expect(explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.queryPatterns)).toBeVisible();

    // explain
    await expect(
      explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.explain)
    ).toBeVisible();

    // editor toggle
    await expect(
      explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.editorToggle)
    ).toBeVisible();

    // options
    await expect(
      explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.options)
    ).toBeVisible();

    // open the options
    await explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.options).click();

    // legend
    await expect(
      explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.legend)
    ).toBeVisible();

    // format
    await expect(
      explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.format)
    ).toBeVisible();

    // type
    await expect(
      explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.type)
    ).toBeVisible();

    if (semver.gte(grafanaVersion, '12.1.0')) {
      // min step
      await expect(
        explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.step)
      ).toBeVisible();
      // exemplars
      await expect(
        explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.exemplars)
      ).toBeVisible();
    } else {
      // min step
      await expect(page.getByText('Min step')).toBeVisible();
      // exemplars
      await expect(page.getByText('Exemplars')).toBeVisible();
    }
  });

  test.describe('Code editor', () => {
    test('it navigates to the code editor with editor type as code', async ({
      readProvisionedDataSource,
      explorePage,
    }) => {
      const dsCodeEditor = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
        fileName: codeEditorProvFile,
      });

      await explorePage.goto();

      await explorePage.datasource.set(dsCodeEditor.name);

      await expect(
        explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)
      ).toBeVisible();
    });

    test('it navigates to the code editor and opens the metrics browser with metric search, labels, label values, and all components', async ({
      readProvisionedDataSource,
      explorePage,
    }) => {
      const dsCodeEditor = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
        fileName: codeEditorProvFile,
      });

      await explorePage.goto();

      await explorePage.datasource.set(dsCodeEditor.name);

      await expect(
        explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)
      ).toBeVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)
        .focus();

      await expect(
        explorePage.getByGrafanaSelector(
          selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton
        )
      ).toBeVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .focus();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .isEnabled();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .click();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.selectMetric)
        .isVisible();

      await expect(
        explorePage.getByGrafanaSelector(
          selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.selectMetric
        )
      ).toBeVisible();

      await explorePage
        .getByGrafanaSelector(
          selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.labelNamesFilter
        )
        .isVisible();

      await explorePage
        .getByGrafanaSelector(
          selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.labelValuesFilter
        )
        .isVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.useQuery)
        .isVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.useAsRateQuery)
        .isVisible();

      await explorePage
        .getByGrafanaSelector(
          selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.validateSelector
        )
        .isVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.clear)
        .isVisible();
    });

    test('selects a metric in the metrics browser and uses the query', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      const dsCodeEditor = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
        fileName: codeEditorProvFile,
      });

      await explorePage.goto();

      await explorePage.datasource.set(dsCodeEditor.name);

      await expect(
        explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)
      ).toBeVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)
        .focus();

      await expect(
        explorePage.getByGrafanaSelector(
          selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton
        )
      ).toBeVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .focus();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .isEnabled();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.openButton)
        .click();

      await expect(
        explorePage.getByGrafanaSelector(
          selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.selectMetric
        )
      ).toBeVisible();

      await page.getByRole('option', { name: 'go_gc_duration_seconds', exact: true }).click();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.metricsBrowser.useQuery)
        .click();

      const testMetric = await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)
        .textContent();

      expect(testMetric).toContain('go_gc_duration_seconds');
    });
  });

  test.describe('Query builder', () => {
    test('it navigates to the query builder with default editor type as builder', async ({
      readProvisionedDataSource,
      explorePage,
      grafanaVersion,
      page,
    }) => {
      const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
        fileName: 'datasources.yml',
      });

      await explorePage.datasource.set(ds.name);
      if (semver.lt(grafanaVersion, '12.0.0')) {
        await page.getByLabel('Metric').isVisible();
      } else {
        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .isVisible();

        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .focus();

        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .isEnabled();

        await expect(
          explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
        ).toBeVisible();
      }
    });

    test('the query builder contains metric select, label filters and operations', async ({
      readProvisionedDataSource,
      explorePage,
      page,
      grafanaVersion,
    }) => {
      const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
        fileName: 'datasources.yml',
      });

      await explorePage.datasource.set(ds.name);
      if (semver.lt(grafanaVersion, '12.0.0')) {
        await page.getByLabel('Metric').isVisible();
      } else {
        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .isEnabled();

        await expect(
          explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
        ).toBeVisible();

        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .focus();
      }
      await expect(explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.labelSelect)).toBeVisible();

      await explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.labelSelect).focus();

      await explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.matchOperatorSelect).focus();

      await expect(
        explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.matchOperatorSelect)
      ).toBeVisible();

      await explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.valueSelect).focus();

      await expect(explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.valueSelect)).toBeVisible();
    });

    /*    test('it can select a metric and provide a hint', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      // const dsDefaultEditorBuilder = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

      await explorePage.goto();

      // await explorePage.datasource.set(dsDefaultEditorBuilder.name);

      await page.getByTestId('data-testid Select a data source').click();

      await page.getByTestId('data-testid Select a data source').fill('Amazon Managed Service for Prometheus');

      await page.getByRole('button', { name: 'Amazon Managed Service for Prometheus' }).click();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isVisible();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).isEnabled();

      await explorePage
        .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).focus();

      await explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect).click()

      await page.getByText(metric, { exact: true }).click();

      const hintText = await explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.hints).textContent();

      expect(hintText).toContain('hint: add rate');
    });
*/

    /*   test('it can select a label filter and run a query', async ({
      readProvisionedDataSource,
      explorePage,
      page,
    }) => {
      // const dsDefaultEditorBuilder = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

      await explorePage.goto();

      // await explorePage.datasource.set(dsDefaultEditorBuilder.name);

      await page.getByTestId('data-testid Select a data source').click();

      await page.getByTestId('data-testid Select a data source').fill('Amazon Managed Service for Prometheus');

      await page.getByRole('button', { name: 'Amazon Managed Service for Prometheus' }).click();
      
      await explorePage
        .getByGrafanaSelector(selectors.components.QueryBuilder.labelSelect).isVisible();
      
      await explorePage
        .getByGrafanaSelector(selectors.components.QueryBuilder.labelSelect).isEnabled();

      await explorePage
        .getByGrafanaSelector(selectors.components.QueryBuilder.labelSelect).focus();
        
      await explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.labelSelect).click()

      await page.getByText('__name__', { exact: true }).click();

      await explorePage.getByGrafanaSelector(selectors.components.QueryBuilder.valueSelect).click();

      await page.getByText(metric, { exact: true }).click();

      await explorePage.runQuery();
    });
*/
    // TODO query for metrics explorer button once prometheusUsesCombobox is GA and enabled by default
    test('it should have the metrics explorer opened via the metric select', async ({
      readProvisionedDataSource,
      explorePage,
      grafanaVersion,
      page,
    }) => {
      const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({
        fileName: 'datasources.yml',
      });

      await explorePage.datasource.set(ds.name);

      if (semver.lt(grafanaVersion, '12.0.0')) {
        await page.getByLabel('Metric').isVisible();
      } else {
        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .isVisible();

        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .isEnabled();

        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .focus();

        await explorePage
          .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricSelect)
          .click();
      }

      // await page.getByText('Metrics explorer', { exact: true }).click();

      // await expect(
      //   explorePage.getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.builder.metricsExplorer)
      // ).toBeVisible();
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
