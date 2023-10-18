package prometheus

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/patrickmn/go-cache"
	apiv1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"go.opentelemetry.io/otel/trace"

	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/prometheus-amazon/pkg/prometheus/client"
	"github.com/grafana/prometheus-amazon/pkg/prometheus/instrumentation"
	"github.com/grafana/prometheus-amazon/pkg/prometheus/querydata"
	"github.com/grafana/prometheus-amazon/pkg/prometheus/resource"
)

var plog = log.New()

type Service struct {
	im       instancemgmt.InstanceManager
	features backend.FeatureToggles
}

type instance struct {
	queryData    *querydata.QueryData
	resource     *resource.Resource
	versionCache *cache.Cache
}

func ProvideService(httpClientProvider httpclient.Provider, cfg *backend.GrafanaCfg, features backend.FeatureToggles, tracer trace.Tracer) *Service {
	plog.Debug("initializing")
	return &Service{
		im:       datasource.NewInstanceManager(newInstanceSettings(httpClientProvider, cfg, features, tracer)),
		features: features,
	}
}

func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	// TODO:
	// - Make HTTP Provider
	// - Get Grafana Config from the context
	// - (Does Provide service actually need both the config and features?)
	// - (Create?) Tracer
	provider := httpclient.NewProvider(httpclient.ProviderOptions{Middlewares: []httpclient.Middleware{httpclient.CustomHeadersMiddleware()}})
	cfg := backend.GrafanaConfigFromContext(ctx)
	return &Datasource{
		Service: ProvideService(*provider, cfg, cfg.FeatureToggles(), tracing.DefaultTracer()),
	}, nil
}

type Datasource struct {
	Service *Service
}

func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	return d.Service.QueryData(ctx, req)
}

func newInstanceSettings(httpClientProvider httpclient.Provider, cfg *backend.GrafanaCfg, features backend.FeatureToggles, tracer trace.Tracer) datasource.InstanceFactoryFunc {
	return func(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
		// Creates a http roundTripper.
		opts, err := client.CreateTransportOptions(settings, cfg, plog)
		if err != nil {
			return nil, fmt.Errorf("error creating transport options: %v", err)
		}
		httpClient, err := httpClientProvider.New(*opts)
		if err != nil {
			return nil, fmt.Errorf("error creating http client: %v", err)
		}

		// New version using custom client and better response parsing
		qd, err := querydata.New(httpClient, features, tracer, settings, plog)
		if err != nil {
			return nil, err
		}

		// Resource call management using new custom client same as querydata
		r, err := resource.New(httpClient, settings, plog)
		if err != nil {
			return nil, err
		}

		return instance{
			queryData:    qd,
			resource:     r,
			versionCache: cache.New(time.Minute*1, time.Minute*5),
		}, nil
	}
}

func (s *Service) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	if len(req.Queries) == 0 {
		err := fmt.Errorf("query contains no queries")
		instrumentation.UpdateQueryDataMetrics(err, nil)
		return &backend.QueryDataResponse{}, err
	}

	i, err := s.getInstance(ctx, req.PluginContext)
	if err != nil {
		instrumentation.UpdateQueryDataMetrics(err, nil)
		return nil, err
	}

	qd, err := i.queryData.Execute(ctx, req)
	instrumentation.UpdateQueryDataMetrics(err, qd)

	return qd, err
}

func (s *Service) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	i, err := s.getInstance(ctx, req.PluginContext)
	if err != nil {
		return err
	}

	if strings.EqualFold(req.Path, "version-detect") {
		versionObj, found := i.versionCache.Get("version")
		if found {
			return sender.Send(versionObj.(*backend.CallResourceResponse))
		}

		vResp, err := i.resource.DetectVersion(ctx, req)
		if err != nil {
			return err
		}
		i.versionCache.Set("version", vResp, cache.DefaultExpiration)
		return sender.Send(vResp)
	}

	resp, err := i.resource.Execute(ctx, req)
	if err != nil {
		return err
	}

	return sender.Send(resp)
}

func (s *Service) getInstance(ctx context.Context, pluginCtx backend.PluginContext) (*instance, error) {
	i, err := s.im.Get(ctx, pluginCtx)
	if err != nil {
		return nil, err
	}
	in := i.(instance)
	return &in, nil
}

// IsAPIError returns whether err is or wraps a Prometheus error.
func IsAPIError(err error) bool {
	// Check if the right error type is in err's chain.
	var e *apiv1.Error
	return errors.As(err, &e)
}

func ConvertAPIError(err error) error {
	var e *apiv1.Error
	if errors.As(err, &e) {
		return fmt.Errorf("%s: %s", e.Msg, e.Detail)
	}
	return err
}
