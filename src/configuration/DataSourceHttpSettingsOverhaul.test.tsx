import { DataSourceSettings } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { DataSourceOptions } from './DataSourceOptions';
import { DataSourceHttpSettingsOverhaul } from './DataSourceHttpSettingsOverhaul';

// The Auth/ConnectionSettings components from @grafana/plugin-ui and the
// @grafana/prometheus style helpers are not under test here, so stub them to
// keep the test focused on the "Forward OAuth Identity" toggle behavior.
jest.mock('@grafana/plugin-ui', () => ({
  Auth: () => <div />,
  ConnectionSettings: () => <div />,
  convertLegacyAuthProps: () => ({ selectedMethod: 'default' }),
  AuthMethod: {
    BasicAuth: 'BasicAuth',
    CrossSiteCredentials: 'CrossSiteCredentials',
    OAuthForward: 'OAuthForward',
  },
}));

jest.mock('@grafana/prometheus', () => ({
  docsTip: () => null,
  overhaulStyles: () => ({
    hrTopSpace: '',
    hrBottomSpace: '',
    sectionBottomPadding: '',
  }),
}));

function makeOptions(jsonData: Partial<DataSourceOptions> = {}): DataSourceSettings<DataSourceOptions, {}> {
  return {
    id: 1,
    uid: 'test-uid',
    orgId: 1,
    name: 'Amazon Managed Service for Prometheus',
    type: 'grafana-amazonprometheus-datasource',
    typeName: 'Amazon Managed Service for Prometheus',
    typeLogoUrl: '',
    access: 'proxy',
    url: '',
    user: '',
    database: '',
    basicAuth: false,
    basicAuthUser: '',
    withCredentials: false,
    isDefault: false,
    jsonData: jsonData as DataSourceOptions,
    secureJsonFields: {},
    version: 1,
    readOnly: false,
  } as DataSourceSettings<DataSourceOptions, {}>;
}

function renderComponent(
  options: DataSourceSettings<DataSourceOptions, {}>,
  onOptionsChange = jest.fn()
) {
  render(
    <DataSourceHttpSettingsOverhaul
      options={options}
      onOptionsChange={onOptionsChange}
      renderSigV4Editor={<div />}
      secureSocksDSProxyEnabled={false}
    />
  );
  return { onOptionsChange };
}

describe('DataSourceHttpSettingsOverhaul - Forward OAuth Identity', () => {
  it('renders the toggle, off by default', () => {
    renderComponent(makeOptions());
    const toggle = screen.getByRole('switch', { name: /Forward OAuth Identity/i });
    expect(toggle).not.toBeChecked();
  });

  it('reflects oauthPassThru=true as a checked toggle', () => {
    renderComponent(makeOptions({ oauthPassThru: true }));
    expect(screen.getByRole('switch', { name: /Forward OAuth Identity/i })).toBeChecked();
  });

  it('sets jsonData.oauthPassThru to true when toggled on', () => {
    const { onOptionsChange } = renderComponent(makeOptions());
    fireEvent.click(screen.getByRole('switch', { name: /Forward OAuth Identity/i }));
    expect(onOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({ oauthPassThru: true }),
      })
    );
  });

  it('sets jsonData.oauthPassThru to false when toggled off', () => {
    const { onOptionsChange } = renderComponent(makeOptions({ oauthPassThru: true }));
    fireEvent.click(screen.getByRole('switch', { name: /Forward OAuth Identity/i }));
    expect(onOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({ oauthPassThru: false }),
      })
    );
  });
});
