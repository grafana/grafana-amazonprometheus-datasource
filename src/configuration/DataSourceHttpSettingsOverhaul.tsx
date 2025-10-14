import { DataSourceSettings } from '@grafana/data';
import { Auth, AuthMethod, ConnectionSettings, convertLegacyAuthProps } from '@grafana/plugin-ui';
import { docsTip, overhaulStyles } from '@grafana/prometheus';
import { SecureSocksProxySettings, useTheme2 } from '@grafana/ui';
import React, { ReactElement, useState } from 'react';
import { useEffectOnce } from 'react-use';

import { DataSourceOptions } from './DataSourceOptions';

type Props = {
  options: DataSourceSettings<DataSourceOptions, {}>;
  onOptionsChange: (options: DataSourceSettings<DataSourceOptions, {}>) => void;
  renderSigV4Editor: React.ReactNode;
  secureSocksDSProxyEnabled: boolean;
};

export const DataSourceHttpSettingsOverhaul = (props: Props) => {
  const { options, onOptionsChange, renderSigV4Editor, secureSocksDSProxyEnabled } = props;

  const newAuthProps = convertLegacyAuthProps({
    config: options,
    onChange: onOptionsChange,
  });

  useEffectOnce(() => {
    // Since we are not allowing users to select another auth,
    // need to update sigV4Auth field to true for auth to work.
    setSigV4Selected(true);
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        sigV4Auth: true,
      },
    });
  });

  const theme = useTheme2();
  const styles = overhaulStyles(theme);

  // for custom auth methods sigV4
  let customMethods: CustomMethod[] = [];

  const [sigV4Selected, setSigV4Selected] = useState<boolean>(options.jsonData.sigV4Auth || false);

  const sigV4Id = 'custom-sigV4Id';

  const sigV4Option: CustomMethod = {
    id: sigV4Id,
    label: 'SigV4 auth',
    description: 'Use SigV4 authentication to connect to your Amazon Managed Service for Prometheus workspace',
    component: <>{renderSigV4Editor}</>,
  };

  customMethods.push(sigV4Option);

  function returnSelectedMethod() {
    if (sigV4Selected) {
      return sigV4Id;
    }

    return newAuthProps.selectedMethod;
  }

  // Do we need this switch anymore? Update the language.
  let urlTooltip;
  switch (options.access) {
    case 'direct':
      urlTooltip = (
        <>
          Your access method is <em>Browser</em>, this means the URL needs to be accessible from the browser.
          {docsTip()}
        </>
      );
      break;
    case 'proxy':
      urlTooltip = (
        <>
          Your access method is <em>Server</em>, this means the URL needs to be accessible from the grafana
          backend/server.
          {docsTip()}
        </>
      );
      break;
    default:
      urlTooltip = <>Specify a complete HTTP URL (for example http://your_server:8080) {docsTip()}</>;
  }

  return (
    <>
      <ConnectionSettings
        urlPlaceholder="http://localhost:9090"
        config={options}
        onChange={onOptionsChange}
        urlLabel="Prometheus server URL"
        urlTooltip={urlTooltip}
      />
      <hr className={`${styles.hrTopSpace} ${styles.hrBottomSpace}`} />
      <Auth
        {...newAuthProps}
        customMethods={customMethods}
        onAuthMethodSelect={(method) => {
          setSigV4Selected(method === sigV4Id);

          onOptionsChange({
            ...options,
            basicAuth: method === AuthMethod.BasicAuth,
            withCredentials: method === AuthMethod.CrossSiteCredentials,
            jsonData: {
              ...options.jsonData,
              sigV4Auth: method === sigV4Id,
              oauthPassThru: method === AuthMethod.OAuthForward,
            },
          });
        }}
        // If your method is selected pass its id to `selectedMethod`,
        // otherwise pass the id from converted legacy data
        selectedMethod={returnSelectedMethod()}
        visibleMethods={[sigV4Id]}
      />
      <div className={styles.sectionBottomPadding} />
      {secureSocksDSProxyEnabled && (
        <>
          <SecureSocksProxySettings options={options} onOptionsChange={onOptionsChange} />
          <div className={styles.sectionBottomPadding} />
        </>
      )}
    </>
  );
};

export type CustomMethodId = `custom-${string}`;

export type CustomMethod = {
  id: CustomMethodId;
  label: string;
  description: string;
  component: ReactElement;
};
