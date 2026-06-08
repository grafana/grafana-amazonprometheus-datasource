---
aliases:
  - ../data-sources/aws-prometheus/alerting/
  - ../data-sources/amazon-prometheus/alerting/
description: Set up alerting with the Amazon Managed Service for Prometheus data source, including Grafana-managed and data-source-managed rules.
keywords:
  - grafana
  - prometheus
  - amazon
  - aws
  - amp
  - alerting
  - recording rules
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Alerting
title: Amazon Managed Service for Prometheus alerting
weight: 450
review_date: 2026-06-08
---

# Amazon Managed Service for Prometheus alerting

The Amazon Managed Service for Prometheus data source works with Grafana Alerting. You can create Grafana-managed alert rules that query your workspace, and you can manage alerting and recording rules stored in the workspace from the Grafana Alerting UI.

## Before you begin

Before you set up alerting, ensure you have:

- [Configured the Amazon Managed Service for Prometheus data source](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/).
- AWS credentials with permission to read and, if you manage rules from Grafana, write rules in the workspace.

## Alerting approaches

The data source supports two complementary alerting approaches.

### Grafana-managed alert rules

Grafana-managed alert rules run in Grafana and can query your Amazon Managed Service for Prometheus workspace as their data source. Grafana evaluates the rule, manages its state, and routes notifications. Use this approach when you want a single alerting experience across all your data sources, including expressions, images in notifications, and multi-data-source rules.

To create a Grafana-managed alert rule, refer to [Configure Grafana-managed alert rules](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/alerting-rules/create-grafana-managed-rule/).

For example, to alert when the rate of HTTP 5xx errors exceeds five percent over the last five minutes, use a query such as:

```promql
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
> 0.05
```

### Data-source-managed rules

The data source can also read and write the recording and alerting rules stored in your workspace. These rules are evaluated by Amazon Managed Service for Prometheus itself, not by Grafana. Use this approach when you want your rules to run close to the data and remain available independently of Grafana.

The data source manages two kinds of rules:

- **Recording rules:** Pre-compute frequently used or expensive expressions and store the results as new time series for faster queries.
- **Alerting rules:** Evaluate a condition and send alerts to the workspace's alert manager when the condition holds.

To manage these rules from Grafana, enable **Manage alerts via Alerting UI** on the data source [configuration page](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/). When enabled, the rules appear in the Grafana Alerting UI, where you can view and edit them.

The data source reaches the workspace ruler through the `/api/v1/rules` and `/config/v1/rules` paths under the **Prometheus server URL** you configure, so you don't need to set a separate ruler URL. If the rules fail to load with an **Unable to fetch alert rules** error, refer to [Troubleshooting](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/troubleshooting/).

Managing rules in the workspace requires AWS credentials with the appropriate `aps` rule-management permissions, such as `aps:ListRuleGroupsNamespaces`, `aps:DescribeRuleGroupsNamespace`, `aps:CreateRuleGroupsNamespace`, `aps:PutRuleGroupsNamespace`, and `aps:DeleteRuleGroupsNamespace`.

{{< admonition type="note" >}}
Data-source-managed rules require a rule groups namespace in your Amazon Managed Service for Prometheus workspace. For more information, refer to the [Amazon Managed Service for Prometheus recording rules documentation](https://docs.aws.amazon.com/prometheus/latest/userguide/AMP-rules.html).
{{< /admonition >}}

## Next steps

- [Configure the data source](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/)
- [Grafana Alerting documentation](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/alerting/)
