import { DataSourcePlugin } from '@grafana/data';
import { ConfigEditor, PromQueryEditorByApp, PrometheusDatasource, PromCheatSheet } from '@grafana/prometheus';

// import PromCheatSheet from './components/PromCheatSheet';
// import PromQueryEditorByApp from './components/PromQueryEditorByApp';
// import { ConfigEditor } from './configuration/ConfigEditor';
// import { PrometheusDatasource } from './datasource';

// @ts-ignore
export const plugin = new DataSourcePlugin(PrometheusDatasource)
  // @ts-ignore  
  .setQueryEditor(PromQueryEditorByApp)
  .setConfigEditor(ConfigEditor)
  // @ts-ignore
  .setQueryEditorHelp(PromCheatSheet);
