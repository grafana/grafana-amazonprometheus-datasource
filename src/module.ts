import { DataSourcePlugin } from '@grafana/data';
import { PromQueryEditorByApp, PrometheusDatasource, PromCheatSheet } from '@grafana/prometheus';

// custom config made with sigV4 auth
import { ConfigEditor } from './configuration/ConfigEditor';


export const plugin = new DataSourcePlugin(PrometheusDatasource) 
  .setQueryEditor(PromQueryEditorByApp)
  .setConfigEditor(ConfigEditor)
  .setQueryEditorHelp(PromCheatSheet);
