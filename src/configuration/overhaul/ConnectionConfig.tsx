import {
  DataSourceJsonData,
  DataSourcePluginOptionsEditorProps,
  DataSourceSettings,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceJsonDataOptionSelect,
  onUpdateDatasourceResetOption,
  onUpdateDatasourceSecureJsonDataOption,
  SelectableValue,
} from '@grafana/data';
import { config } from '@grafana/runtime';
import { ButtonGroup, FieldSet, InlineField, Input, Select, ToolbarButton } from '@grafana/ui';
import React, { FC, useEffect, useMemo, useState } from 'react';

export enum AwsAuthType {
  Keys = 'keys',
  Credentials = 'credentials',
  Default = 'default', // was 'arn',
  EC2IAMRole = 'ec2_iam_role',
  /**
   * @deprecated use default
   */
  ARN = 'arn',
  GrafanaAssumeRole = 'grafana_assume_role',
}

export interface AwsAuthDataSourceJsonData extends DataSourceJsonData {
  authType?: AwsAuthType;
  assumeRoleArn?: string;
  externalId?: string;
  profile?: string; // Credentials profile name, as specified in ~/.aws/credentials
  defaultRegion?: string; // region if it is not defined by your credentials file
  endpoint?: string;
}

export interface AwsAuthDataSourceSecureJsonData {
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
}

export type AwsAuthDataSourceSettings = DataSourceSettings<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData>;

export const awsAuthProviderOptions: Array<SelectableValue<AwsAuthType>> = [
  {
    label: 'Workspace IAM Role',
    value: AwsAuthType.EC2IAMRole,
  },
  {
    label: 'Grafana Assume Role',
    value: AwsAuthType.GrafanaAssumeRole,
  },
  {
    label: 'AWS SDK Default',
    value: AwsAuthType.Default,
  },
  {
    label: 'Access & secret key',
    value: AwsAuthType.Keys,
  },
  {
    label: 'Credentials file',
    value: AwsAuthType.Credentials,
  },
];

export const standardRegions: string[] = [
  'af-south-1',
  'ap-east-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'cn-north-1',
  'cn-northwest-1',
  'eu-central-1',
  'eu-north-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'me-south-1',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-gov-east-1',
  'us-gov-west-1',
  'us-iso-east-1',
  'us-isob-east-1',
  'us-west-1',
  'us-west-2',
];

export const DEFAULT_LABEL_WIDTH = 28;
const toOption = (value: string) => ({ value, label: value });
const isAwsAuthType = (value: any): value is AwsAuthType => {
  return typeof value === 'string' && awsAuthProviderOptions.some((opt) => opt.value === value);
};

export interface ConnectionConfigProps<
  J extends AwsAuthDataSourceJsonData = AwsAuthDataSourceJsonData,
  S = AwsAuthDataSourceSecureJsonData,
> extends DataSourcePluginOptionsEditorProps<J, S> {
  standardRegions?: string[];
  loadRegions?: () => Promise<string[]>;
  defaultEndpoint?: string;
  skipHeader?: boolean;
  skipEndpoint?: boolean;
  children?: React.ReactNode;
  labelWidth?: number;
  inExperimentalAuthComponent?: boolean;
}

export const ConnectionConfig: FC<ConnectionConfigProps> = (props: ConnectionConfigProps) => {
  const [regions, setRegions] = useState((props.standardRegions || standardRegions).map(toOption));
  const { loadRegions, onOptionsChange, skipHeader = false, skipEndpoint = false } = props;
  const { labelWidth = DEFAULT_LABEL_WIDTH, options, inExperimentalAuthComponent } = props;
  let profile = options.jsonData.profile;
  if (profile === undefined) {
    profile = options.database;
  }
  const tempCredsFeatureEnabled = config.featureToggles.awsDatasourcesTempCredentials;
  const awsAssumeRoleEnabled = config.awsAssumeRoleEnabled;
  const awsAllowedAuthProviders = useMemo(
    () =>
      config.awsAllowedAuthProviders
        .filter((provider) => (provider === AwsAuthType.GrafanaAssumeRole ? tempCredsFeatureEnabled : true))
        .filter(isAwsAuthType),
    [tempCredsFeatureEnabled]
  );

  const currentProvider = awsAuthProviderOptions.find((p) => p.value === options.jsonData.authType);

  useEffect(() => {
    // Make sure a authType exists in the current model
    if (!currentProvider && awsAllowedAuthProviders.length) {
      onOptionsChange({
        ...options,
        jsonData: {
          ...options.jsonData,
          authType: awsAllowedAuthProviders[0],
        },
      });
    }
  }, [currentProvider, options, onOptionsChange, awsAllowedAuthProviders]);

  useEffect(() => {
    if (!loadRegions) {
      return;
    }

    loadRegions().then((regions) => setRegions(regions.map(toOption)));
  }, [loadRegions]);

  // const inExperimentalAuthComponent = options.jsonData.inExperimentalAuthComponent;

  const inputWidth = inExperimentalAuthComponent ? 'width-20' : 'width-30';

  return (
    <FieldSet label={skipHeader ? '' : 'Connection Details'} data-testid="connection-config">
      <InlineField
        label="Authentication Provider"
        labelWidth={labelWidth}
        tooltip="Specify which AWS credentials chain to use."
      >
        <Select
          aria-label="Authentication Provider"
          className={inputWidth}
          value={currentProvider}
          options={awsAuthProviderOptions.filter((opt) => awsAllowedAuthProviders.includes(opt.value!))}
          defaultValue={options.jsonData.authType}
          onChange={(option) => {
            onUpdateDatasourceJsonDataOptionSelect(props, 'authType')(option);
          }}
          menuShouldPortal={true}
        />
      </InlineField>
      {options.jsonData.authType === 'credentials' && (
        <InlineField
          label="Credentials Profile Name"
          labelWidth={labelWidth}
          tooltip="Credentials profile name, as specified in ~/.aws/credentials, leave blank for default."
        >
          <Input
            aria-label="Credentials Profile Name"
            className={inputWidth}
            placeholder="default"
            value={profile}
            onChange={onUpdateDatasourceJsonDataOption(props, 'profile')}
          />
        </InlineField>
      )}

      {options.jsonData.authType === 'keys' && (
        <>
          <InlineField label="Access Key ID" labelWidth={labelWidth}>
            {props.options.secureJsonFields?.accessKey ? (
              <ButtonGroup className={inputWidth}>
                <Input disabled placeholder="Configured" />
                <ToolbarButton
                  icon="edit"
                  tooltip="Edit Access Key ID"
                  type="button"
                  onClick={onUpdateDatasourceResetOption(props as any, 'accessKey')}
                />
              </ButtonGroup>
            ) : (
              <Input
                aria-label="Access Key ID"
                className={inputWidth}
                value={options.secureJsonData?.accessKey ?? ''}
                onChange={onUpdateDatasourceSecureJsonDataOption(props, 'accessKey')}
              />
            )}
          </InlineField>

          <InlineField label="Secret Access Key" labelWidth={labelWidth}>
            {props.options.secureJsonFields?.secretKey ? (
              <ButtonGroup className={inputWidth}>
                <Input disabled placeholder="Configured" />
                <ToolbarButton
                  icon="edit"
                  type="button"
                  tooltip="Edit Secret Access Key"
                  onClick={onUpdateDatasourceResetOption(props as any, 'secretKey')}
                />
              </ButtonGroup>
            ) : (
              <Input
                aria-label="Secret Access Key"
                className={inputWidth}
                value={options.secureJsonData?.secretKey ?? ''}
                onChange={onUpdateDatasourceSecureJsonDataOption(props, 'secretKey')}
              />
            )}
          </InlineField>
        </>
      )}

      {awsAssumeRoleEnabled && (
        <>
          <InlineField
            label="Assume Role ARN"
            labelWidth={labelWidth}
            tooltip="Optionally, specify the ARN of a role to assume. Specifying a role here will ensure that the selected authentication provider is used to assume the specified role rather than using the credentials directly. Leave blank if you don't need to assume a role at all"
          >
            <Input
              aria-label="Assume Role ARN"
              className={inputWidth}
              placeholder="arn:aws:iam:*"
              value={options.jsonData.assumeRoleArn || ''}
              onChange={onUpdateDatasourceJsonDataOption(props, 'assumeRoleArn')}
            />
          </InlineField>
          {options.jsonData.authType !== AwsAuthType.GrafanaAssumeRole && (
            <InlineField
              label="External ID"
              labelWidth={labelWidth}
              tooltip="If you are assuming a role in another account, that has been created with an external ID, specify the external ID here."
            >
              <Input
                aria-label="External ID"
                className={inputWidth}
                placeholder="External ID"
                value={options.jsonData.externalId || ''}
                onChange={onUpdateDatasourceJsonDataOption(props, 'externalId')}
              />
            </InlineField>
          )}
        </>
      )}
      {!skipEndpoint && (
        <InlineField
          label="Endpoint"
          labelWidth={labelWidth}
          tooltip="Optionally, specify a custom endpoint for the service"
        >
          <Input
            aria-label="Endpoint"
            className={inputWidth}
            placeholder={props.defaultEndpoint ?? 'https://{service}.{region}.amazonaws.com'}
            value={options.jsonData.endpoint || ''}
            onChange={onUpdateDatasourceJsonDataOption(props, 'endpoint')}
          />
        </InlineField>
      )}
      <InlineField
        label="Default Region"
        labelWidth={labelWidth}
        tooltip="Specify the region, such as for US West (Oregon) use ` us-west-2 ` as the region."
      >
        <Select
          aria-label="Default Region"
          className={inputWidth}
          value={regions.find((region) => region.value === options.jsonData.defaultRegion)}
          options={regions}
          defaultValue={options.jsonData.defaultRegion}
          allowCustomValue={true}
          onChange={onUpdateDatasourceJsonDataOptionSelect(props, 'defaultRegion')}
          formatCreateLabel={(r) => `Use region: ${r}`}
          menuShouldPortal={true}
        />
      </InlineField>
      {props.children}
    </FieldSet>
  );
};
