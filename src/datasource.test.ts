import {
  AbstractLabelOperator,
  DataSourceApi,
  DataSourceInstanceSettings,
  hasQueryExportSupport,
  hasQueryImportSupport,
} from '@grafana/data';
import { TemplateSrv } from '@grafana/runtime';
import { PrometheusLanguageProviderInterface, PromOptions, PromQuery } from '@grafana/prometheus';
import { DataQuery } from '@grafana/schema';

import { AmazonPrometheusDatasource } from './datasource';

const instanceSettings = {
  id: 1,
  uid: 'amp-uid',
  type: 'grafana-amazonprometheus-datasource',
  name: 'AMP',
  access: 'proxy',
  url: '/api/datasources/proxy/1',
  jsonData: { httpMethod: 'POST' },
  readOnly: false,
} as unknown as DataSourceInstanceSettings<PromOptions>;

const templateSrv = {
  replace: (value: string) => value,
  getVariables: () => [],
  containsTemplate: () => false,
  updateTimeRange: () => {},
} as unknown as TemplateSrv;

const languageProvider = {} as unknown as PrometheusLanguageProviderInterface;

const createDatasource = () => new AmazonPrometheusDatasource(instanceSettings, templateSrv, languageProvider);

describe('AmazonPrometheusDatasource', () => {
  describe('query preservation when switching data source type', () => {
    it('should not advertise abstract query import support, so Grafana falls back to importQueries', () => {
      // updateQueries in Grafana core prefers the lossy abstract-query path
      // (label matchers only, aggregations dropped) whenever this returns true.
      // https://github.com/grafana/grafana-amazonprometheus-datasource/issues/477
      expect(hasQueryImportSupport(createDatasource())).toBe(false);
    });

    it('should keep advertising abstract query export support for switches away from AMP', () => {
      expect(hasQueryExportSupport(createDatasource())).toBe(true);
    });
  });

  describe('constructor arity', () => {
    it('should have exactly one required constructor parameter, or Grafana 11.x loads it as an Angular plugin', () => {
      expect(AmazonPrometheusDatasource.length).toBe(1);
    });
  });

  describe('importQueries', () => {
    const promQueries: PromQuery[] = [
      { refId: 'A', expr: 'avg(node_cpu_seconds_total{mode="idle"})' },
      { refId: 'B', expr: 'rate(http_requests_total[5m])' },
    ];

    it('should preserve queries verbatim when switching from a core Prometheus data source', async () => {
      const origin = { meta: { id: 'prometheus' } } as DataSourceApi;

      // eslint-disable-next-line @typescript-eslint/no-deprecated -- deliberate: importQueries is the only hook that receives raw origin queries, see datasource.ts
      const imported = await createDatasource().importQueries(promQueries, origin);

      expect(imported).toEqual(promQueries);
    });

    it('should preserve queries verbatim when switching from the Azure Prometheus data source', async () => {
      const origin = { meta: { id: 'grafana-azureprometheus-datasource' } } as DataSourceApi;

      // eslint-disable-next-line @typescript-eslint/no-deprecated -- deliberate: importQueries is the only hook that receives raw origin queries, see datasource.ts
      const imported = await createDatasource().importQueries(promQueries, origin);

      expect(imported).toEqual(promQueries);
    });

    it('should build queries from abstract queries when the origin exports them', async () => {
      const origin = {
        meta: { id: 'graphite' },
        exportToAbstractQueries: async (queries: DataQuery[]) => [
          {
            refId: 'A',
            labelMatchers: [
              { name: '__name__', operator: AbstractLabelOperator.Equal, value: 'node_cpu_seconds_total' },
              { name: 'job', operator: AbstractLabelOperator.Equal, value: 'node' },
            ],
          },
        ],
      } as unknown as DataSourceApi;

      // eslint-disable-next-line @typescript-eslint/no-deprecated -- deliberate: importQueries is the only hook that receives raw origin queries, see datasource.ts
      const imported = await createDatasource().importQueries([{ refId: 'A' }], origin);

      expect(imported).toHaveLength(1);
      expect(imported[0].expr).toBe('{__name__="node_cpu_seconds_total", job="node"}');
    });

    it('should return no queries when the origin has no compatible queries', async () => {
      const origin = { meta: { id: 'testdata' } } as DataSourceApi;

      // eslint-disable-next-line @typescript-eslint/no-deprecated -- deliberate: importQueries is the only hook that receives raw origin queries, see datasource.ts
      const imported = await createDatasource().importQueries(promQueries, origin);

      expect(imported).toEqual([]);
    });
  });
});
