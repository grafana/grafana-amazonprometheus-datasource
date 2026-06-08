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
title: Troubleshoot the Amazon Managed Service for Prometheus data source
weight: 500
review_date: 2026-06-08
---

# Troubleshoot the Amazon Managed Service for Prometheus data source

This document provides solutions to common issues you may encounter when configuring or using the Amazon Managed Service for Prometheus data source. For configuration instructions, refer to [Configure the Amazon Managed Service for Prometheus data source](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/).

## Authentication errors

These errors occur when AWS credentials are invalid, missing, or don't have the required permissions.

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

**Example IAM policy that grants query access:**

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
        "aps:GetMetricMetadata"
      ],
      "Resource": "arn:aws:aps:<REGION>:<ACCOUNT_ID>:workspace/<WORKSPACE_ID>"
    }
  ]
}
```

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
