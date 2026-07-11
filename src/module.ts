import { DataSourcePlugin } from '@grafana/data';
import { initPluginTranslations } from '@grafana/i18n';
import { loadResources, PromCheatSheet, PromQueryEditorByApp } from '@grafana/prometheus';

// custom config made with sigV4 auth
import { ConfigEditor } from './configuration/ConfigEditor';
import { AmazonPrometheusDatasource } from './datasource';
import pluginJson from './plugin.json';

if (process.env.NODE_ENV !== 'test') {
  void initPluginTranslations(pluginJson.id, [loadResources]);
}

export const plugin = new DataSourcePlugin(AmazonPrometheusDatasource)
  .setQueryEditor(PromQueryEditorByApp)
  .setConfigEditor(ConfigEditor)
  .setQueryEditorHelp(PromCheatSheet);
