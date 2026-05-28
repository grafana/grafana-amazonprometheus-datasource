import path from 'node:path';

import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import grafanaConfig, { type Env } from './.config/webpack/webpack.config';

const config = async (env: Env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    resolve: {
      // Force @grafana/i18n and react-i18next to a single canonical path.
      // @grafana/prometheus installs its own nested copies; only one gets
      // initialized by initPluginTranslations(), causing t() errors in dev.
      alias: {
        '@grafana/i18n$': path.resolve(__dirname, 'node_modules/@grafana/i18n'),
        'react-i18next$': path.resolve(__dirname, 'node_modules/react-i18next'),
      },
    },
  });
};

export default config;
