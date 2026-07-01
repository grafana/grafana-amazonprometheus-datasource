---
aliases:
  - ../data-sources/aws-prometheus/troubleshooting/
  - ../data-sources/amazon-prometheus/troubleshooting/
description: Troubleshooting guide for the Amazon Managed Service for Prometheus data source in Grafana.
keywords:
  - grafana
  - prometheus
  - amazon
  - aws
  - amp
  - troubleshooting
  - errors
  - authentication
  - query
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Troubleshooting
title: Troubleshoot Amazon Managed Service for Prometheus issues
weight: 500
review_date: 2026-06-08
---

# Troubleshoot Amazon Managed Service for Prometheus issues

This document provides solutions to common issues you may encounter when configuring or using the Amazon Managed Service for Prometheus data source. For configuration instructions, refer to [Configure the Amazon Managed Service for Prometheus data source](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/).

## Plugin and interface errors

These errors occur when the plugin is outdated or fails to load in the Grafana interface.

### "Plugin not found", "Datasource not found", or blank settings tabs

An outdated plugin version is a common cause of interface errors and missing settings.

**Symptoms:**

- The data source settings tabs are blank or fail to render.
- Errors such as **Plugin not found** or **Datasource not found** appear.
- The browser console shows JavaScript errors such as `TypeError: Cannot read properties of undefined`.

**Solutions:**

1. Check the installed plugin version. Navigate to **Plugins and data** > **Plugins** and select **Amazon Managed Service for Prometheus**.
1. If an update is available, click **Update** to install the latest version. In Grafana Cloud, plugins update automatically.
1. After updating, reload the data source configuration page.
1. Confirm your Grafana version meets the plugin's minimum requirement. For the supported versions, refer to [Requirements](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/#requirements).
1. If the errors persist, restart Grafana and clear your browser cache.

For install, upgrade, and catalog issues, refer to [Troubleshoot installation issues](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/install/#troubleshoot-installation-issues).

## Authentication errors

These errors occur when AWS credentials are invalid, missing, or don't have the required permissions, or when the SigV4 authentication option isn't enabled on your instance.

### SigV4 authentication option is missing

In some Grafana Cloud instances, the SigV4 authentication option isn't enabled by default and must be turned on for your instance.

**Symptoms:**

- The authentication drop-down shows only options such as **Basic auth**, **Forward OAuth Identity**, and **No Authentication**.
- **SigV4 auth** doesn't appear as an authentication method.
- You can't complete the data source configuration because there's no way to enter AWS credentials.

**Solution:**

If the SigV4 option is missing from the authentication drop-down in Grafana Cloud, contact [Grafana Support](https://grafana.com/help/) to enable SigV4 authentication for your instance. After Support enables it and the instance restarts, the **SigV4 auth** option appears in the authentication drop-down.

### "Access denied" or "Authorization failed"

These errors indicate that the identity Grafana uses can't query the workspace.

**Symptoms:**

- Save & test fails with an authorization error.
- Queries return access denied messages.
- Metrics and labels don't load in the query editor.

**Possible causes and solutions:**

| Cause | Solution |
|-------|----------|
| Missing permissions | Attach an IAM policy that grants query permissions to the identity. Refer to the [Amazon Managed Service for Prometheus IAM documentation](https://docs.aws.amazon.com/prometheus/latest/userguide/security-iam.html). |
| Invalid credentials | Verify the access key ID and secret access key in the AWS console. Regenerate them if necessary. |
| Expired credentials | Create new credentials and update the data source configuration. |
| Wrong region | Verify the **Default Region** matches the region of your workspace. |
| Assume-role trust issue | Verify the role's trust policy allows the Grafana identity to assume it and that the **External ID** matches. |

**Required IAM permissions:**

Grant the identity the `aps` permissions for the features you use. Missing permissions, such as `aps:ListRules` or `aps:DescribeRuleGroupsNamespace`, are a common cause of access-denied errors.

| Capability | Required `aps` actions |
|------------|------------------------|
| Query metrics | `aps:QueryMetrics`, `aps:GetLabels`, `aps:GetSeries`, `aps:GetMetricMetadata` |
| Read alerting and recording rules | `aps:ListRules`, `aps:ListRuleGroupsNamespaces`, `aps:DescribeRuleGroupsNamespace` |
| Manage alerting and recording rules | `aps:CreateRuleGroupsNamespace`, `aps:PutRuleGroupsNamespace`, `aps:DeleteRuleGroupsNamespace` |
| Manage the alert manager | `aps:GetAlertManagerSilence`, `aps:CreateAlertManagerSilence`, `aps:PutAlertManagerSilences`, `aps:DeleteAlertManagerSilence` |

**Example IAM policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "aps:QueryMetrics",
        "aps:GetLabels",
        "aps:GetSeries",
        "aps:GetMetricMetadata",
        "aps:ListRules",
        "aps:ListRuleGroupsNamespaces",
        "aps:DescribeRuleGroupsNamespace",
        "aps:CreateRuleGroupsNamespace",
        "aps:PutRuleGroupsNamespace",
        "aps:DeleteRuleGroupsNamespace"
      ],
      "Resource": "arn:aws:aps:<REGION>:<ACCOUNT_ID>:workspace/<WORKSPACE_ID>"
    }
  ]
}
```

If you only query metrics and don't manage rules from Grafana, you can omit the rule and alert manager actions.

### "Access denied" when assuming a role

When you use an assume-role configuration, the role's trust policy must allow the calling identity to assume it. For Grafana Cloud, the calling identity is the Grafana Labs AWS account `008923505280`.

**Symptoms:**

- Save & test fails even though the role has the correct `aps` permissions.
- Logs mention `AccessDenied` on `sts:AssumeRole`.

**Solutions:**

1. Verify the trust policy lists the correct principal. For Grafana Cloud, use the Grafana Labs account `008923505280`.
1. Verify the **External ID** in the data source configuration matches the `sts:ExternalId` condition in the trust policy.
1. Verify the **Assume Role ARN** in the data source matches the role you configured.

**Example trust policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::008923505280:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<EXTERNAL_ID>"
        }
      }
    }
  ]
}
```

For a self-managed Grafana instance, replace `008923505280` with the account or IAM user ARN that runs Grafana.

### "InvalidClientTokenId" or STS AssumeRole 403 errors

These errors occur when AWS Security Token Service (STS) rejects the credentials used to assume the role.

**Symptoms:**

- Save & test fails with `InvalidClientTokenId` or an HTTP `403` from STS.
- Logs mention `sts:AssumeRole` failures.

**Solutions:**

1. Verify the base credentials, such as the access key or instance role, are valid and not expired.
1. Verify STS is enabled for the region. If you use regional STS endpoints, confirm the region is activated in your AWS account.
1. Verify the **Assume Role ARN** is correct and the role exists in the target account.
1. Verify the base identity has `sts:AssumeRole` permission for the target role.

### "SignatureDoesNotMatch" or signature errors

This error means AWS rejected the request signature.

**Solutions:**

1. Verify the secret access key is correct and has no leading or trailing whitespace.
1. Verify the **Default Region** matches the workspace region, because SigV4 signs requests per region.
1. Verify the **Service** field is set to `aps` unless AWS instructs you to use a different value.
1. Verify the Grafana server clock is accurate, because a large clock skew invalidates signatures.

## Connection errors

These errors occur when Grafana can't reach the workspace endpoint.

### "Connection refused" or timeout errors

These errors indicate a network or endpoint problem rather than an authentication problem.

**Symptoms:**

- The data source test times out.
- Queries fail with network errors.
- Connection issues are intermittent.

**Solutions:**

1. Verify the **Prometheus server URL** is the correct workspace query endpoint and includes the workspace path.
1. Verify network connectivity from the Grafana server to the workspace endpoint.
1. Check that firewall rules allow outbound HTTPS on port 443.
1. For Grafana Cloud accessing a private endpoint, configure [Private data source connect](https://grafana.com/docs/grafana-cloud/connect-externally-hosted/private-data-source-connect/).

### VPC endpoint and PrivateLink access denied

If you reach your workspace through an AWS PrivateLink (VPC) endpoint, the endpoint policy can block requests even when IAM permissions are correct.

**Symptoms:**

- Requests fail with access-denied errors only when routed through the VPC endpoint.
- The same identity works from a public endpoint but not the private one.

**VPC endpoint policy checklist:**

1. Confirm the VPC endpoint for `com.amazonaws.<REGION>.aps-workspaces` exists and is in the **Available** state.
1. Confirm the endpoint policy allows the calling principal. For Grafana Cloud, allow the Grafana Labs account `008923505280` or the role it assumes.
1. Confirm the endpoint policy allows the required `aps` actions, such as `aps:QueryMetrics` and the label and series actions.
1. Confirm the endpoint policy `Resource` includes your workspace ARN.
1. Confirm the endpoint's security group allows inbound HTTPS on port 443 from the source network.
1. Confirm DNS resolves the workspace endpoint to the private endpoint addresses.

## Query errors

These errors occur when running queries against the workspace.

### "No data" or empty results

A query can succeed yet return no data.

**Symptoms:**

- The query runs without error but returns no data.
- Panels show a **No data** message.

**Possible causes and solutions:**

| Cause | Solution |
|-------|----------|
| Time range has no data | Expand the dashboard time range or verify the metric exists for that period. |
| Metric name typo | Verify the metric name with the metrics browser. |
| Label selector too narrow | Remove or broaden label filters in the query. |
| Data not yet ingested | Verify your Prometheus agent or collector is sending data to the workspace. |

### Query timeout

Large or unbounded queries can exceed the query timeout.

**Symptoms:**

- The query runs for a long time and then fails.
- The error mentions a timeout or query limit.

**Solutions:**

1. Narrow the time range to reduce the data volume.
1. Add label filters to reduce the number of series.
1. Increase the **Query timeout** on the data source configuration page.
1. Use recording rules to pre-compute expensive expressions.

## Template variable errors

These errors occur when using template variables with the data source.

### Variables return no values

Empty variables usually point to a connection or permissions problem.

**Solutions:**

1. Verify the data source connection works by running Save & test.
1. Verify the variable query uses a valid function such as `label_values()`.
1. Check that parent variables in a chain have valid selections.
1. Verify the identity has permission to list labels and series.

### Variables are slow to load

Large workspaces can make variable queries slow.

**Solutions:**

1. Set the variable refresh to **On dashboard load** instead of **On time range change**.
1. Narrow the scope of the variable query with label filters.
1. Enable **Disable metric lookup** if you don't need metric autocomplete.

## Performance issues

These issues relate to slow queries or AWS service limits.

### Throttling or rate limit errors

Amazon Managed Service for Prometheus enforces request quotas.

**Symptoms:**

- Errors mention throttling or rate limits.
- Dashboard panels intermittently fail to load.

**Solutions:**

1. Reduce the dashboard refresh frequency.
1. Increase the query step or **Min step** to request fewer data points.
1. Enable query caching in Grafana, available in Grafana Enterprise and Grafana Cloud.
1. Request a quota increase from AWS for your workspace.

## Alerting errors

These errors occur when Grafana can't load or manage rules stored in your workspace.

### "Unable to fetch alert rules"

This error appears when Grafana can't retrieve the alerting and recording rules from the workspace ruler.

**Symptoms:**

- The Grafana Alerting UI shows **Unable to fetch alert rules**.
- Data-source-managed rules don't load even though queries work and IAM permissions are correct.

**Possible causes and solutions:**

| Cause | Solution |
|-------|----------|
| Rule management not enabled | Enable **Manage alerts via Alerting UI** on the data source [configuration page](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/). |
| Missing rule read permissions | Grant `aps:ListRules`, `aps:ListRuleGroupsNamespaces`, and `aps:DescribeRuleGroupsNamespace` to the identity. |
| No rule groups namespace | Create a rule groups namespace in the workspace. The ruler returns an error until at least one namespace exists. |
| Incorrect workspace URL | Verify the **Prometheus server URL** is correct. The data source serves the ruler from the `/rules` and `/config/v1/rules` paths under this URL, so no separate ruler URL is required. |
| Platform-side issue | If your configuration and permissions are correct, this error can be a Grafana Cloud platform issue, such as a data proxy problem on a specific cluster. Contact [Grafana Support](https://grafana.com/help/) to escalate. |

{{< admonition type="note" >}}
The **Unable to fetch alert rules** error isn't always a configuration problem. When IAM permissions and the workspace URL are correct, the cause can be platform-side and require escalation to Grafana Support rather than a change on your end.
{{< /admonition >}}

## Enable debug logging

To capture detailed error information for troubleshooting:

1. Set the Grafana log level to `debug` in the configuration file:

   ```ini
   [log]
   level = debug
   ```

1. Review logs in `/var/log/grafana/grafana.log`, or your configured log location.
1. Look for entries from the `grafana-amazonprometheus-datasource` plugin that include request and response details.
1. Reset the log level to `info` after troubleshooting to avoid excessive log volume.

## Get additional help

If you've tried these solutions and still encounter issues:

1. Check the [Grafana community forums](https://community.grafana.com/) for similar issues.
1. Review the [plugin GitHub issues](https://github.com/grafana/grafana-amazonprometheus-datasource/issues) for known bugs.
1. Consult the [Amazon Managed Service for Prometheus documentation](https://docs.aws.amazon.com/prometheus/) for service-specific guidance.
1. Contact Grafana Support if you're an Enterprise, Cloud Pro, or Cloud Contracted user.
1. When reporting issues, include:
   - Grafana version and plugin version.
   - Error messages, with sensitive information redacted.
   - Steps to reproduce.
   - Relevant configuration, with credentials redacted.
