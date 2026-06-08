---
aliases:
  - ../data-sources/aws-prometheus/query-editor/
  - ../data-sources/amazon-prometheus/query-editor/
description: Use the Amazon Managed Service for Prometheus query editor in Grafana to build PromQL queries with the builder and code modes.
keywords:
  - grafana
  - prometheus
  - amazon
  - aws
  - amp
  - promql
  - query editor
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Query editor
title: Amazon Managed Service for Prometheus query editor
weight: 200
review_date: 2026-06-08
---

# Amazon Managed Service for Prometheus query editor

This document explains how to use the Amazon Managed Service for Prometheus query editor. The query editor is the same as the core Grafana Prometheus query editor and uses PromQL to query your workspace.

## Before you begin

Before you write queries, ensure you have:

- [Configured the Amazon Managed Service for Prometheus data source](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/).
- Verified that your AWS credentials have permission to query the workspace.

## Key concepts

If you're new to Prometheus, these terms are used throughout this document:

| Term | Description |
|------|-------------|
| **PromQL** | The Prometheus Query Language, used to select and aggregate time series data. |
| **Instant query** | Returns a single value per series at the end of the time range. |
| **Range query** | Returns a series of values over the dashboard time range. |
| **Metrics browser** | A tool in the query editor that helps you search metrics, select labels, and build a selector. |

## Query editor modes

The query editor has two modes that you switch between with the toggle in the upper-right of the editor.

### Builder mode

Builder mode is a visual, guided way to build queries without writing PromQL by hand. Use builder mode to:

- Select a metric from the **Metric** drop-down or open the metrics browser.
- Add label filters to narrow the result set.
- Add operations such as `rate`, `sum`, or `histogram_quantile`.

Click **Explain** to display a step-by-step, plain-language description of what the query does.

### Code mode

Code mode lets you write raw PromQL with autocomplete, syntax highlighting, and the metrics browser. Use code mode for complex queries or when you already know PromQL.

To open the metrics browser in code mode, focus the query field and click **Metrics browser**. From there you can search metrics, select labels and label values, validate a selector, and insert it into your query.

## Kickstart your query

Click **Kickstart your query** to choose from a list of query patterns, such as rate or histogram patterns. Grafana inserts the pattern into the editor so you can adapt it to your metrics.

## Query options

Expand **Options** in the query editor to configure how Grafana runs and displays the query.

| Option | Description |
|--------|-------------|
| **Legend** | Controls the time series name in the legend. Use **Auto**, **Verbose**, or a **Custom** template such as `{{label_name}}`. |
| **Format** | Sets the result format: **Time series**, **Table**, or **Heatmap**. |
| **Type** | Sets the query type: **Range**, **Instant**, or **Both**. |
| **Min step** | The lower bound for the query step and `$__interval`. Match this to your scrape interval. |
| **Exemplars** | Toggles whether to show exemplars alongside the query results. |

## Macros

Use macros in your queries to reference the dashboard time range and interval. Grafana replaces the macro with the computed value at query time.

| Macro | Description |
|-------|-------------|
| `$__interval` | The interval Grafana calculates from the time range and panel width. |
| `$__interval_ms` | The interval in milliseconds. |
| `$__range` | The full dashboard time range, for example `1h`. |
| `$__range_s` | The dashboard time range in seconds. |
| `$__range_ms` | The dashboard time range in milliseconds. |
| `$__rate_interval` | An interval tuned for `rate` functions that's always at least four times the scrape interval. |
| `$__rate_interval_ms` | The rate interval in milliseconds. |

## Query examples

The following examples show common PromQL queries you can run against your workspace. Replace the metric and label names with the ones in your workspace.

### Rates and throughput

Use the `rate` function with `$__rate_interval` to chart per-second rates from counters.

Calculate the per-second rate of HTTP requests:

```promql
rate(http_requests_total[$__rate_interval])
```

Calculate total requests per second across all instances of a service:

```promql
sum(rate(http_requests_total{job="api"}[$__rate_interval]))
```

### Aggregations

Use aggregation operators such as `sum`, `avg`, and `max` with `by` to group results.

Aggregate CPU usage by instance:

```promql
sum by (instance) (rate(node_cpu_seconds_total{mode!="idle"}[$__rate_interval]))
```

Find the top five pods by memory usage:

```promql
topk(5, sum by (pod) (container_memory_working_set_bytes))
```

### Error rates and ratios

Divide a filtered rate by a total rate to compute an error percentage.

Calculate the percentage of HTTP 5xx responses:

```promql
sum(rate(http_requests_total{status=~"5.."}[$__rate_interval]))
/
sum(rate(http_requests_total[$__rate_interval]))
* 100
```

### Latency percentiles

Use `histogram_quantile` with a `_bucket` metric to chart latency percentiles.

Calculate the 95th percentile request latency:

```promql
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[$__rate_interval])))
```

### Resource utilization

Combine metrics to express utilization as a percentage.

Calculate memory utilization per node as a percentage:

```promql
100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)
```

Show which targets are currently down:

```promql
up == 0
```

### Use a template variable in a query

Reference a [template variable](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/template-variables/) to make a query interactive. For example, filter by a selected `instance` value:

```promql
rate(node_cpu_seconds_total{instance=~"$instance"}[$__rate_interval])
```

## Use cases

Use cases help you understand what's possible and provide starting points for your own dashboards:

- **Monitor container workloads:** Track CPU, memory, and restart counts for Kubernetes and Amazon ECS workloads that send metrics to your workspace.
- **Track service-level indicators:** Build error-rate and latency panels from request metrics to power service-level objective dashboards.
- **Capacity planning:** Aggregate resource usage over long time ranges to spot trends and plan scaling.

## Next steps

- [Use template variables](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/template-variables/)
- [Add annotations](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/annotations/)
- [Set up alerting](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/alerting/)
