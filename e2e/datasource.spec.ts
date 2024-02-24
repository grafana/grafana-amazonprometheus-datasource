import { test, expect } from '@grafana/plugin-e2e';

test('should expand multi-valued variable before calling backend', async ({
  readProvisionedDataSource,
}) => {
  const datasource = readProvisionedDataSource({ fileName: 'datasources.yml' });
});
