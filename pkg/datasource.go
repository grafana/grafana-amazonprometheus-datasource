package main

import (
	"context"

	"github.com/grafana/grafana-aws-sdk/pkg/awsauth"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	sdkhttpclient "github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"

	"github.com/grafana/grafana/pkg/promlib"
)

func NewDatasource(ctx context.Context, dsInstanceSettings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	plog := backend.NewLoggerWith("logger", "tsdb.amazon-prometheus")
	plog.Debug("Initializing")

	authSettings := awsds.ReadAuthSettings(ctx)
	return &Datasource{
		Service:      promlib.NewService(sdkhttpclient.NewProvider(), plog, extendClientOpts),
		authSettings: *authSettings,
	}, nil
}

type Datasource struct {
	Service *promlib.Service

	authSettings awsds.AuthSettings
}

func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	ctx = d.contextualMiddlewares(ctx)
	return d.Service.QueryData(ctx, req)
}

func (d *Datasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	ctx = d.contextualMiddlewares(ctx)
	return d.Service.CallResource(ctx, req, sender)
}

func (d *Datasource) GetBuildInfo(ctx context.Context, req promlib.BuildInfoRequest) (*promlib.BuildInfoResponse, error) {
	ctx = d.contextualMiddlewares(ctx)
	return d.Service.GetBuildInfo(ctx, req)
}

func (d *Datasource) GetHeuristics(ctx context.Context, req promlib.HeuristicsRequest) (*promlib.Heuristics, error) {
	ctx = d.contextualMiddlewares(ctx)
	return d.Service.GetHeuristics(ctx, req)
}

func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult,
	error) {
	ctx = d.contextualMiddlewares(ctx)
	return d.Service.CheckHealth(ctx, req)
}

func (d *Datasource) contextualMiddlewares(ctx context.Context) context.Context {
	cfg := backend.GrafanaConfigFromContext(ctx)

	middlewares := []sdkhttpclient.Middleware{
		sdkhttpclient.ResponseLimitMiddleware(cfg.ResponseLimit()),
		awsauth.NewSigV4Middleware(),
	}

	return sdkhttpclient.WithContextualMiddleware(ctx, middlewares...)
}

func extendClientOpts(_ context.Context, _ backend.DataSourceInstanceSettings, clientOpts *sdkhttpclient.Options, _ log.Logger) error {
	// Set SigV4 service namespace
	if clientOpts.SigV4 != nil {
		clientOpts.SigV4.Service = "aps"
	}

	return nil
}
