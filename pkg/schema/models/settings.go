package models

import (
	promlibmodels "github.com/grafana/grafana-prometheus-datasource/pkg/promlib/models"
)

// DatasourceSettings is the datasource's jsonData shape: the shared PromOptions
// settings model plus this plugin's own SigV4 auth and custom fields.
type DatasourceSettings struct {
	promlibmodels.PromOptions

	KeepCookies []string `json:"keepCookies"`
	Timeout     int      `json:"timeout"`

	SigV4Auth          bool   `json:"sigV4Auth"`
	SigV4AuthType      string `json:"sigV4AuthType"`
	SigV4Profile       string `json:"sigV4Profile"`
	SigV4AssumeRoleArn string `json:"sigV4AssumeRoleArn"`
	SigV4ExternalID    string `json:"sigV4ExternalId"`
	SigV4Region        string `json:"sigV4Region"`

	Sigv4Service             string `json:"sigv4Service"`
	ForwardGrafanaUserHeader bool   `json:"forwardGrafanaUserHeader"`
	PrometheusTypeMigration  bool   `json:"prometheus-type-migration"`
}
