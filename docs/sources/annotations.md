---
aliases:
  - ../data-sources/aws-prometheus/annotations/
  - ../data-sources/amazon-prometheus/annotations/
description: Use the Amazon Managed Service for Prometheus data source to add annotations to Grafana dashboards from PromQL queries.
keywords:
  - grafana
  - prometheus
  - amazon
  - aws
  - amp
  - annotations
  - promql
labels:
  products:
    - cloud
    - enterprise
    - oss
menuTitle: Annotations
title: Amazon Managed Service for Prometheus annotations
weight: 400
review_date: 2026-06-08
---

# Amazon Managed Service for Prometheus annotations

Annotations overlay event markers on dashboard graphs so you can correlate metrics with events such as deployments or incidents. The Amazon Managed Service for Prometheus data source supports annotations driven by PromQL queries, the same as the core Grafana Prometheus data source.

## Before you begin

Before you add annotations, ensure you have:

- [Configured the Amazon Managed Service for Prometheus data source](https://grafana.com/docs/plugins/grafana-amazonprometheus-datasource/latest/configure/).
- A metric in your workspace that marks the events you want to annotate, such as `ALERTS` or a custom event metric.

## Add an annotation query

To add an annotation query to a dashboard:

1. Navigate to **Dashboard settings** > **Annotations**.
1. Click **Add annotation query**.
1. Enter a name for the annotation.
1. Select the Amazon Managed Service for Prometheus data source.
1. Enter a PromQL query in the code query field. Any series the query returns becomes an annotation marker.
1. Configure the field mappings, then click **Apply**.

## Map query results to annotation fields

Use the following options to control how Grafana builds each annotation from the query results.

| Field | Description |
|-------|-------------|
| **Min step** | The lower bound for the query step, which controls how often Grafana samples the series. |
| **Title** | A template for the annotation title. Reference labels with the `{{label_name}}` syntax. |
| **Tags** | A template for the annotation tags, populated from series labels. |
| **Text** | A template for the annotation description. Reference labels with the `{{label_name}}` syntax. |
| **Series value as timestamp** | When enabled, Grafana interprets the series value as a Unix timestamp in seconds and places the annotation at that time instead of at the data point's own time. |

## Annotation query examples

The following examples show common annotation queries. After you enter a query, use the **Title**, **Text**, and **Tags** fields to format each marker from the series labels.

To create an annotation each time a Prometheus alert fires, query the built-in `ALERTS` metric:

```promql
ALERTS{alertstate="firing"}
```

Set the **Title** to `{{alertname}}` and the **Text** to `{{alertstate}}` so each marker shows the alert name and state.

To mark when a monitored target goes down, query for targets that report as down:

```promql
up == 0
```

Set the **Title** to `{{job}} down` and add `{{instance}}` to the **Tags** field.

To mark host reboots, query for changes in the node boot time within each step:

```promql
changes(node_boot_time_seconds[$__interval]) > 0
```

To place annotations from a metric that stores an event time as its value, such as a deployment timestamp, enable **Series value as timestamp**:

```promql
deployment_timestamp_seconds
```
