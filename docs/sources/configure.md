---
aliases:
  - ../data-sources/aws-prometheus/configure/
  - ../data-sources/amazon-prometheus/configure/
description: Configure the Amazon Managed Service for Prometheus data source in Grafana, including AWS SigV4 authentication and provisioning.
keywords:
  - grafana
  - prometheus
  - amazon
  - aws
  - amp
  - sigv4
  - authentication
  - configuration
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Configure
title: Configure the Amazon Managed Service for Prometheus data source
weight: 100
review_date: 2026-06-08
---

# Configure the Amazon Managed Service for Prometheus data source

This document explains how to configure the Amazon Managed Service for Prometheus data source and covers AWS SigV4 authentication, data source settings, and provisioning.

## Before you begin

Before you configure the data source, ensure you have:

- **Grafana permissions:** The organization administrator role to add and configure data sources.
- **An Amazon Managed Service for Prometheus workspace:** Including its query endpoint URL, which ends in `/api/v1/query`.
- **AWS credentials:** An IAM identity or role with permission to query the workspace, such as `aps:QueryMetrics`, `aps:GetLabels`, `aps:GetSeries`, and `aps:GetMetricMetadata`.

## Key concepts

If you're new to Amazon Managed Service for Prometheus or AWS authentication, these terms are used throughout the configuration:

| Term | Description |
|------|-------------|
| **Workspace** | A logical, isolated Amazon Managed Service for Prometheus environment that ingests, stores, and queries your Prometheus metrics. |
| **SigV4** | AWS Signature Version 4, the process AWS uses to authenticate and sign API requests with your credentials. |
| **IAM policy** | A JSON document attached to an identity that grants AWS API permissions, such as querying a workspace. |
| **Assume role** | An AWS mechanism that lets one identity take on temporary credentials for another role, often used for cross-account access. |
| **External ID** | An optional identifier added to a role's trust policy to protect against the confused-deputy problem when assuming a role. |
| **Default region** | The AWS region where your workspace is located. SigV4 uses this region to sign requests. |

## Add the data source

To add the data source:

1. Click **Connections** in the left-side menu.
1. Click **Add new connection**.
1. Type `Amazon Managed Service for Prometheus` in the search bar.
1. Select **Amazon Managed Service for Prometheus**.
1. Click **Add new data source**.

## Configure settings

Use the following settings to identify the data source and set its endpoint.

| Setting | Description |
|---------|-------------|
| **Name** | The name used to refer to the data source in panels and queries. |
| **Default** | Toggle to make this the default data source for new panels. |
| **Prometheus server URL** | The query endpoint URL of your Amazon Managed Service for Prometheus workspace, for example `https://aps-workspaces.<REGION>.amazonaws.com/workspaces/<WORKSPACE_ID>`. |

{{< admonition type="note" >}}
Browser (direct) access mode isn't available in this data source. Use server (proxy) access mode, which Grafana selects by default.
{{< /admonition >}}

## Authentication

The Amazon Managed Service for Prometheus data source authenticates with AWS SigV4. Unlike the core Prometheus data source, SigV4 is the only authentication method, and Grafana signs every request to the workspace.

### SigV4 authentication

Select an authentication provider in the **Authentication Provider** drop-down, then complete the fields for the provider you choose.

| Authentication provider | Description |
|-------------------------|-------------|
| **AWS SDK Default** | Uses the credential chain of the environment that runs Grafana, such as environment variables, a shared credentials file, or an attached IAM role. Recommended when Grafana runs in AWS. |
| **Access & secret key** | Uses an access key ID and secret access key that you enter directly. |
| **Credentials file** | Uses a named profile from the AWS shared credentials file on the Grafana server. |
| **EC2 IAM role** | Uses the IAM role attached to the EC2 instance that runs Grafana. |
| **Grafana Assume Role** | Lets Grafana Cloud assume a role in your AWS account without sharing long-lived keys. Available in Grafana Cloud. |

Depending on the provider you select, configure the following fields:

| Setting | Description |
|---------|-------------|
| **Access Key ID** | The AWS access key ID. Required for the **Access & secret key** provider. |
| **Secret Access Key** | The AWS secret access key. Required for the **Access & secret key** provider. |
| **Credentials Profile Name** | The named profile to use from the shared credentials file. Used with the **Credentials file** provider. |
| **Assume Role ARN** | The Amazon Resource Name (ARN) of a role for Grafana to assume before signing requests. Optional. |
| **External ID** | The external ID required by the assumed role's trust policy. Use with **Assume Role ARN**. |
| **Endpoint** | A custom endpoint for the AWS API. Leave empty to use the default endpoint for the selected region. |
| **Default Region** | The AWS region of your workspace. SigV4 uses this region to sign requests. |
| **Service** | The AWS service to sign requests against. Defaults to `aps` for Amazon Managed Service for Prometheus. Change this only if AWS instructs you to use a different service name. |

## Additional settings

Expand **Advanced settings** to configure optional behavior. These settings are shared with the core Prometheus data source.

| Setting | Description |
|---------|-------------|
| **Manage alerts via Alerting UI** | When enabled, lets you manage recording and alerting rules stored in the workspace from the Grafana Alerting UI. |
| **Scrape interval** | Sets the interval Grafana uses to align queries. Set this to match the scrape interval configured in Prometheus. The default is `15s`. |
| **Query timeout** | The maximum time Grafana waits for a query to return. The default is `60s`. |
| **Default editor** | Sets the default query editor mode, either **Builder** or **Code**. |
| **Disable metric lookup** | Disables the metric and label autocomplete and the metrics browser to reduce load on large workspaces. |
| **Cache level** | Controls how aggressively Grafana caches metadata responses. Options are `Low`, `Medium`, `High`, and `None`. |
| **Incremental querying** | When enabled, Grafana caches query results and requests only new data on dashboard refreshes. |
| **Query overlap window** | When incremental querying is enabled, the amount of overlapping time to re-request to avoid gaps, for example `10m`. |
| **Disable recording rules** | Prevents Grafana from querying for and processing recording rules. |
| **Custom query parameters** | Appends custom URL parameters to all queries, such as `max_source_resolution=5m`. |
| **HTTP method** | The HTTP method Grafana uses for queries. `POST` is recommended and is the default. |

## Verify the connection

To verify the connection, click **Save & test**. When the configuration is valid, Grafana displays a success message such as **Successfully queried the Prometheus API.** If the test fails, refer to [Troubleshooting](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/troubleshooting/).

## Provision the data source

You can define and configure the data source in code so it's reproducible across environments. This section covers provisioning with a Grafana YAML file and with Terraform.

### Provision with a YAML file

You can define the data source in YAML files as part of Grafana's provisioning system. For more information, refer to [Provisioning Grafana](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/administration/provisioning/#data-sources).

The following example provisions the data source with the **Access & secret key** provider:

```yaml
apiVersion: 1

datasources:
  - name: Amazon Managed Service for Prometheus
    uid: grafana-amazonprometheus
    type: grafana-amazonprometheus-datasource
    access: proxy
    url: https://aps-workspaces.<REGION>.amazonaws.com/workspaces/<WORKSPACE_ID>
    editable: true
    jsonData:
      httpMethod: POST
      sigV4Auth: true
      sigV4AuthType: keys
      sigV4Region: <REGION>
      sigv4Service: aps
      defaultEditor: builder
      manageAlerts: true
    secureJsonData:
      sigV4AccessKey: <ACCESS_KEY_ID>
      sigV4SecretKey: <SECRET_ACCESS_KEY>
```

When you use the **Grafana Assume Role** or an assume-role configuration, set `sigV4AuthType` to `default` or `ec2_iam_role` as appropriate, and provide `assumeRoleArn` and `externalId` instead of the access keys:

```yaml
apiVersion: 1

datasources:
  - name: Amazon Managed Service for Prometheus
    type: grafana-amazonprometheus-datasource
    access: proxy
    url: https://aps-workspaces.<REGION>.amazonaws.com/workspaces/<WORKSPACE_ID>
    jsonData:
      sigV4Auth: true
      sigV4AuthType: default
      sigV4Region: <REGION>
      sigv4Service: aps
      assumeRoleArn: arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>
      externalId: <EXTERNAL_ID>
```

Replace the placeholder values:

- `<REGION>`: The AWS region of your workspace, for example `us-east-1`.
- `<WORKSPACE_ID>`: The ID of your Amazon Managed Service for Prometheus workspace.
- `<ACCESS_KEY_ID>` and `<SECRET_ACCESS_KEY>`: AWS credentials for the **Access & secret key** provider.
- `<ACCOUNT_ID>`, `<ROLE_NAME>`, and `<EXTERNAL_ID>`: The values for the role you want Grafana to assume.

### Provision with Terraform

You can manage the data source with the [Grafana Terraform provider](https://registry.terraform.io/providers/grafana/grafana/latest/docs) using the `grafana_data_source` resource. Store secrets such as AWS keys in Terraform variables or a secrets manager rather than in plain text.

The following example provisions the data source with the **Access & secret key** provider:

```hcl
resource "grafana_data_source" "amazonprometheus" {
  type = "grafana-amazonprometheus-datasource"
  name = "Amazon Managed Service for Prometheus"
  url  = "https://aps-workspaces.${var.region}.amazonaws.com/workspaces/${var.workspace_id}"

  json_data_encoded = jsonencode({
    httpMethod    = "POST"
    sigV4Auth     = true
    sigV4AuthType = "keys"
    sigV4Region   = var.region
    sigv4Service  = "aps"
    defaultEditor = "builder"
    manageAlerts  = true
  })

  secure_json_data_encoded = jsonencode({
    sigV4AccessKey = var.access_key_id
    sigV4SecretKey = var.secret_access_key
  })
}
```

To use an assume-role configuration instead of static keys, set `sigV4AuthType` to `default` or `ec2_iam_role` and provide the role details:

```hcl
resource "grafana_data_source" "amazonprometheus" {
  type = "grafana-amazonprometheus-datasource"
  name = "Amazon Managed Service for Prometheus"
  url  = "https://aps-workspaces.${var.region}.amazonaws.com/workspaces/${var.workspace_id}"

  json_data_encoded = jsonencode({
    sigV4Auth     = true
    sigV4AuthType = "default"
    sigV4Region   = var.region
    sigv4Service  = "aps"
    assumeRoleArn = var.assume_role_arn
    externalId    = var.external_id
  })
}
```

Define the referenced variables, for example in a `variables.tf` file:

```hcl
variable "region" {
  type = string
}

variable "workspace_id" {
  type = string
}

variable "access_key_id" {
  type      = string
  sensitive = true
}

variable "secret_access_key" {
  type      = string
  sensitive = true
}
```
