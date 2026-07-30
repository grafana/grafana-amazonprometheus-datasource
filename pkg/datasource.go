package main

import (
	"context"
	"net/http"

	"github.com/grafana/grafana-aws-sdk/pkg/awsauth"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	sdkhttpclient "github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/config"
	"github.com/grafana/grafana-plugin-sdk-go/data/utils/maputil"

	"github.com/grafana/grafana-prometheus-datasource/pkg/promlib"
	"github.com/grafana/grafana-prometheus-datasource/pkg/promlib/utils"
)

// grafanaUserHeader is the header Grafana uses to forward the logged-in user's
// login to the plugin (populated when send_user_header is enabled server-side).
const grafanaUserHeader = "X-Grafana-User"

func NewDatasource(ctx context.Context, dsInstanceSettings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	plog := backend.NewLoggerWith("logger", "tsdb.amazon-prometheus")
	plog.Debug("Initializing")

	forwardGrafanaUser := false
	if len(dsInstanceSettings.JSONData) > 0 {
		jsonData, err := utils.GetJsonData(dsInstanceSettings)
		if err != nil {
			return nil, err
		}
		forwardGrafanaUser, err = maputil.GetBoolOptional(jsonData, "forwardGrafanaUserHeader")
		if err != nil {
			return nil, err
		}
	}

	authSettings := awsds.ReadAuthSettings(ctx)
	return &Datasource{
		Service:            promlib.NewService(sdkhttpclient.NewProvider(), plog, extendClientOpts),
		authSettings:       *authSettings,
		forwardGrafanaUser: forwardGrafanaUser,
	}, nil
}

type Datasource struct {
	Service *promlib.Service

	authSettings awsds.AuthSettings

	// forwardGrafanaUser controls whether the logged-in user's X-Grafana-User
	// header is forwarded to the upstream workspace.
	forwardGrafanaUser bool
}

func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	ctx = d.contextualMiddlewares(ctx, req.GetHTTPHeaders())
	return d.Service.QueryData(ctx, req)
}

func (d *Datasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	ctx = d.contextualMiddlewares(ctx, req.GetHTTPHeaders())
	return d.Service.CallResource(ctx, req, sender)
}

func (d *Datasource) GetBuildInfo(ctx context.Context, req promlib.BuildInfoRequest) (*promlib.BuildInfoResponse, error) {
	ctx = d.contextualMiddlewares(ctx, nil)
	return d.Service.GetBuildInfo(ctx, req)
}

func (d *Datasource) GetHeuristics(ctx context.Context, req promlib.HeuristicsRequest) (*promlib.Heuristics, error) {
	ctx = d.contextualMiddlewares(ctx, nil)
	return d.Service.GetHeuristics(ctx, req)
}

func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult,
	error) {
	ctx = d.contextualMiddlewares(ctx, req.GetHTTPHeaders())
	return d.Service.CheckHealth(ctx, req)
}

func (d *Datasource) contextualMiddlewares(ctx context.Context, headers http.Header) context.Context {
	cfg := config.GrafanaConfigFromContext(ctx)

	middlewares := []sdkhttpclient.Middleware{
		sdkhttpclient.ResponseLimitMiddleware(cfg.ResponseLimit()),
		awsauth.NewSigV4Middleware(),
	}

	// Forward only the logged-in user's X-Grafana-User header to the upstream
	// workspace when enabled. Unlike ForwardHTTPHeaders, this deliberately does
	// not pass along the user's OAuth token, cookies, or any other headers.
	if d.forwardGrafanaUser {
		if user := headers.Get(grafanaUserHeader); user != "" {
			middlewares = append(middlewares, forwardHeaderMiddleware(grafanaUserHeader, user))
		}
	}

	return sdkhttpclient.WithContextualMiddleware(ctx, middlewares...)
}

// forwardHeaderMiddleware returns a middleware that sets the given header on the
// outgoing request, without overwriting a value that is already present.
func forwardHeaderMiddleware(name, value string) sdkhttpclient.Middleware {
	return sdkhttpclient.MiddlewareFunc(func(_ sdkhttpclient.Options, next http.RoundTripper) http.RoundTripper {
		return sdkhttpclient.RoundTripperFunc(func(req *http.Request) (*http.Response, error) {
			if req.Header.Get(name) == "" {
				req.Header.Set(name, value)
			}
			return next.RoundTrip(req)
		})
	})
}

func extendClientOpts(_ context.Context, settings backend.DataSourceInstanceSettings, clientOpts *sdkhttpclient.Options, _ log.Logger) error {
	// Set SigV4 service namespace
	if clientOpts.SigV4 != nil {
		jsonData, err := utils.GetJsonData(settings)
		if err != nil {
			return err
		}
		service, err := maputil.GetStringOptional(jsonData, "sigv4Service")
		if err != nil || service == "" {
			clientOpts.SigV4.Service = "aps"
		} else {
			clientOpts.SigV4.Service = service
		}
	}

	return nil
}
