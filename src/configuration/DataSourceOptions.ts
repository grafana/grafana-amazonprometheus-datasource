import { PromOptions } from '@grafana/prometheus';

export interface DataSourceOptions extends PromOptions {
  'prometheus-type-migration'?: boolean;
}
