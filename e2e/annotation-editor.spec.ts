import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { test, expect } from '@grafana/plugin-e2e';
import { PromOptions } from '@grafana/prometheus';

test.describe('Prometheus annotation query editor', () => {
  test('Check that the editor uses the code editor', async ({
    readProvisionedDataSource,
    annotationEditPage,
    page,
  }) => {
    const ds = await readProvisionedDataSource<DataSourcePluginOptionsEditorProps<PromOptions>>({ fileName: 'datasources.yml' });
    
    await page.getByTestId('data-testid Select a data source').click();

    await page.getByTestId('data-testid Select a data source').fill(ds.name);

    await page.getByRole('button', { name: `${ds.name}` }).click();

    await expect(annotationEditPage
      .getByGrafanaSelector(selectors.components.DataSource.Prometheus.queryEditor.code.queryField)).toBeVisible();
  });
});
