---
aliases:
  - ../data-sources/aws-prometheus/template-variables/
  - ../data-sources/amazon-prometheus/template-variables/
description: Use template variables with the Amazon Managed Service for Prometheus data source to create dynamic, reusable Grafana dashboards.
keywords:
  - grafana
  - prometheus
  - amazon
  - aws
  - amp
  - template variables
  - promql
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Template variables
title: Amazon Managed Service for Prometheus template variables
weight: 300
review_date: 2026-06-08
---

# Amazon Managed Service for Prometheus template variables

Use template variables to create dynamic, reusable dashboards that let you change displayed data without editing queries. The Amazon Managed Service for Prometheus data source supports the same template variable features as the core Grafana Prometheus data source.

## Before you begin

Before you create template variables, ensure you have:

- [Configured the Amazon Managed Service for Prometheus data source](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/).
- A basic understanding of [Grafana template variables](https://grafana.com/docs/grafana/<GRAFANA_VERSION>/dashboards/variables/).

## Supported variable types

The data source supports the following template variable types.

| Variable type | Supported |
|---------------|-----------|
| Query | Yes |
| Custom | Yes |
| Text box | Yes |
| Constant | Yes |
| Data source | Yes |
| Interval | Yes |
| Ad hoc filters | Yes |

## Create a query variable

Query variables get their values from your workspace. To create a query variable:

1. Navigate to **Dashboard settings** > **Variables**.
1. Click **Add variable**.
1. Select **Query** as the variable type.
1. Select the Amazon Managed Service for Prometheus data source.
1. Select a query type and enter the query details.
1. Click **Apply** to save the variable.

## Query variable functions

The query variable editor supports the following Prometheus functions to populate variable values.

| Function | Description |
|----------|-------------|
| `label_names()` | Returns a list of all label names in the workspace. |
| `label_values(label)` | Returns a list of values for the specified label across all metrics. |
| `label_values(metric, label)` | Returns a list of values for the specified label on the specified metric. |
| `metrics(regex)` | Returns a list of metrics that match the regular expression. |
| `query_result(query)` | Returns the result of a PromQL query, useful for filtering on computed values. |

For example, to populate a variable with every value of the `instance` label on the `node_cpu_seconds_total` metric:

```promql
label_values(node_cpu_seconds_total, instance)
```

## Use variables in queries

Reference a variable in a query with the `$variable_name` or `${variable_name}` syntax. For example, if you have a variable named `instance`, filter a query by the selected instance:

```promql
rate(node_cpu_seconds_total{instance="$instance"}[$__rate_interval])
```

When a variable allows multiple values, use the regex match operator so the query matches any selected value:

```promql
rate(node_cpu_seconds_total{instance=~"$instance"}[$__rate_interval])
```

To use multi-value variables, set the **Multi-value** option on the variable and use the `=~` operator. Grafana formats the selected values as a regular expression alternation, such as `value1|value2`.
