import { PromOptions } from '@grafana/prometheus';

export interface DataSourceOptions extends PromOptions {
  'prometheus-type-migration'?: boolean;
  sigV4Auth?: boolean;
  sigv4Service?: string;
  forwardGrafanaUserHeader?: boolean;
}
