package client

import (
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	sdkhttpclient "github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"

	"github.com/grafana/prometheus-amazon/pkg/gcopypaste/maputil"
	"github.com/grafana/prometheus-amazon/pkg/prometheus/middleware"
	"github.com/grafana/prometheus-amazon/pkg/prometheus/utils"
)

// CreateTransportOptions creates options for the http client. Probably should be shared and should not live in the
// buffered package.
func CreateTransportOptions(settings backend.DataSourceInstanceSettings, cfg *backend.GrafanaCfg, logger log.Logger) (*sdkhttpclient.Options, error) {
	opts, err := settings.HTTPClientOptions()
	if err != nil {
		return nil, fmt.Errorf("error getting HTTP options: %w", err)
	}

	jsonData, err := utils.GetJsonData(settings)
	if err != nil {
		return nil, fmt.Errorf("error reading settings: %w", err)
	}
	httpMethod, _ := maputil.GetStringOptional(jsonData, "httpMethod")

	opts.Middlewares = middlewares(logger, httpMethod)

	// Set SigV4 service namespace
	if opts.SigV4 != nil {
		opts.SigV4.Service = "aps"
	}

	return &opts, nil
}

func middlewares(logger log.Logger, httpMethod string) []sdkhttpclient.Middleware {
	middlewares := []sdkhttpclient.Middleware{
		// TODO: probably isn't needed anymore and should by done by http infra code
		middleware.CustomQueryParameters(logger),
		sdkhttpclient.CustomHeadersMiddleware(),
	}

	// Needed to control GET vs POST method of the requests
	if strings.ToLower(httpMethod) == "get" {
		middlewares = append(middlewares, middleware.ForceHttpGet(logger))
	}

	return middlewares
}
