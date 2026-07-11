import { DataSourceApi, hasQueryExportSupport } from '@grafana/data';
import { PrometheusDatasource, PromQuery } from '@grafana/prometheus';
import { DataQuery } from '@grafana/schema';

// Data source types whose queries are PromQL, so they can be reused as-is.
const PROMQL_COMPATIBLE_TYPES = new Set([
  'prometheus',
  'grafana-amazonprometheus-datasource',
  'grafana-azureprometheus-datasource',
]);

// Grafana routes data source switches through the abstract-query flow whenever
// `importFromAbstractQueries` exists anywhere on the prototype chain
// (`hasQueryImportSupport` uses the `in` operator). That flow keeps only label
// matchers, dropping aggregations and functions from the PromQL expression, so
// the inherited method has to be removed rather than overridden for Grafana to
// fall back to `importQueries` below. The plugin bundles its own copy of
// `@grafana/prometheus`, so mutating the prototype affects nothing else.
// https://github.com/grafana/grafana-amazonprometheus-datasource/issues/477
const importFromAbstractQueries = PrometheusDatasource.prototype.importFromAbstractQueries;
delete (PrometheusDatasource.prototype as Partial<PrometheusDatasource>).importFromAbstractQueries;

export class AmazonPrometheusDatasource extends PrometheusDatasource {
  async importQueries(queries: DataQuery[], originDataSource: DataSourceApi): Promise<PromQuery[]> {
    if (PROMQL_COMPATIBLE_TYPES.has(originDataSource.meta.id)) {
      // The origin queries are PromQL queries, they only need a shallow copy.
      return queries.map((query) => ({ ...query }) as PromQuery);
    }

    // Non-PromQL origins (Graphite, Loki, ...) keep the label-matcher
    // conversion these switches used before.
    if (hasQueryExportSupport(originDataSource)) {
      const abstractQueries = await originDataSource.exportToAbstractQueries(queries);
      return importFromAbstractQueries.call(this, abstractQueries);
    }

    return [];
  }
}
