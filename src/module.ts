import { DataSourcePlugin } from '@grafana/data';
import { PromQueryEditorByApp, PrometheusDatasource, PromCheatSheet } from '@grafana/prometheus';

// custom config made with sigV4 auth
import { ConfigEditor } from './configuration/ConfigEditor';

// @ts-ignore
export const plugin = new DataSourcePlugin(PrometheusDatasource)
  // @ts-ignore  
  .setQueryEditor(PromQueryEditorByApp)
  .setConfigEditor(ConfigEditor)
  // @ts-ignore
  .setQueryEditorHelp(PromCheatSheet);
