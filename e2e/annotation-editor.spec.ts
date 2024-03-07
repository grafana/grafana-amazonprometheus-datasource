import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { test, expect } from '@grafana/plugin-e2e';
import { PromOptions } from '@grafana/prometheus';

test.describe('Prometheus annotation query editor', () => {
  test('Check that the editor uses the code editor', async ({
    readProvisionedDataSource,
    annotationEditPage
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });

    await annotationEditPage.datasource.set(ds.name);
    await annotationEditPage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField).focus();

    await expect(annotationEditPage
      .getByTestIdOrAriaLabel(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)).toBeVisible();
  });
});
