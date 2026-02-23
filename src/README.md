## Compatibility

Amazon Managed Service for Prometheus 2.0.0 is not compatible with Grafana<11.5.0 If you are running version 11.4.x and lower, please use plugin version 1.0.5

# Amazon Managed Service for Prometheus Data Source

Amazon Managed Service for Prometheus is a Prometheus-compatible service that monitors and provides alerts on containerized applications and infrastructure at scale.

Read more about it here:

[https://aws.amazon.com/prometheus/](https://aws.amazon.com/prometheus/)

## Add the data source

1. Configure this data source similar to the [Prometheus data source](https://grafana.com/docs/grafana/latest/datasources/prometheus/configure-prometheus-data-source/).
1. Configure AWS authentication with SigV4. Read these [docs](https://grafana.com/docs/grafana/latest/datasources/aws-cloudwatch/aws-authentication/) for more information on using AWS authentication in Grafana data sources. Read more about SigV4 [here](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-authenticating-requests.html).

Read more about connecting to Prometheus using SigV4 authenitication here: [Connect to Amazon Managed Service for Prometheus](https://grafana.com/docs/grafana/latest/datasources/prometheus/configure/aws-authentication/)