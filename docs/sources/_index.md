# Amazon Managed Service for Prometheus Data Source

This data source plugin is for the Amazon Managed Service for Prometheus. It has all the features of the Grafana core Prometheus plugin with Amazon specific authentication in the configuration page.

Amazon Managed Service for Prometheus is a Prometheus-compatible service that monitors and provides alerts on containerized applications and infrastructure at scale.

Read more about it here:

[https://aws.amazon.com/prometheus/](https://aws.amazon.com/prometheus/)


## Migrate from core Prometheus to Amazon Managed Service for Prometheus

If you are using core Prometheus with SigV4 authentication, you must migrate to the Amazon Managed Service for Prometheus data source because SigV4 auth is deprecated in core Prometheus. This topic summarizes the steps required to migrate from core Prometheus to Amazon Managed Service for Prometheus. See a detailed list of steps [here](src/README.md).

- Get the `UID` for Prometheus using SigV4.
- Get the `UID` for your new Amazon Managed Service for Prometheus.
- Update dashboards with the new datasource `UID`.
- Update alert rules by exporting provisioning files and updating the data source in the model or create new alert rules.
- Recreate correlations.
- Recreate recorded queries.

## Getting started

1. [Install the plugin](https://grafana.com/docs/grafana/latest/administration/plugin-management/#install-grafana-plugins)
1. [Add a new data source with the UI](https://grafana.com/docs/grafana/latest/datasources/#add-a-data-source) or [provision one](https://grafana.com/docs/grafana/latest/administration/provisioning/)
1. [Configure the data source](#configuring-the-data-source)
1. Start making queries

## Configuring the data source

### Authentication

Depending on the environment in which it is run, Grafana supports different authentication providers such as keys, a credentials file, or using the "Default" provider from AWS which supports using service-based IAM roles. These providers can be manually enabled/disabled with the `allowed_auth_providers` field in Grafana's config file. To read more about supported authentication providers refer to [the AWS authentication section](https://grafana.com/docs/grafana/latest/datasources/aws-cloudwatch/aws-authentication/#select-an-authentication-method)

### Plugin repository

You can request new features, report issues, or contribute code directly through the [Grafana Amazon Prometheus Data Source Github repository](https://github.com/grafana/grafana-amazonprometheus-datasource)