import { DataSourcePlugin } from '@grafana/data';
import { initPluginTranslations } from '@grafana/i18n';
import { loadResources, PromCheatSheet, PrometheusDatasource, PromQueryEditorByApp } from '@grafana/prometheus';

// custom config made with sigV4 auth
import { ConfigEditor } from './configuration/ConfigEditor';
import pluginJson from './plugin.json';

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

if (process.env.NODE_ENV !== 'test') {
  void initPluginTranslations(pluginJson.id, [loadResources]);
}

export const plugin = new DataSourcePlugin(PrometheusDatasource)
  .setQueryEditor(PromQueryEditorByApp)
  .setConfigEditor(ConfigEditor)
  .setQueryEditorHelp(PromCheatSheet);
