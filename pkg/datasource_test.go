package main

import (
	"context"
	"net/http"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	sdkhttpclient "github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/stretchr/testify/require"
)

func TestNewDatasource(t *testing.T) {
	ds, err := NewDatasource(context.Background(), backend.DataSourceInstanceSettings{Name: "test-datasource"})
	require.NoError(t, err)
	require.NotNil(t, ds)
}

func TestExtendClientOpts_SigV4Service(t *testing.T) {
	t.Run("service name persists", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"sigv4Service": "another-service"}`),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{
			SigV4: &sdkhttpclient.SigV4Config{},
		}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.Equal(t, "another-service", opts.SigV4.Service)
	})

	t.Run("default aps when field not provided", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte("{}"),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{
			SigV4: &sdkhttpclient.SigV4Config{},
		}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.Equal(t, "aps", opts.SigV4.Service)
	})

	t.Run("default aps when field is empty string", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"sigv4Service": ""}`),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{
			SigV4: &sdkhttpclient.SigV4Config{},
		}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.Equal(t, "aps", opts.SigV4.Service)
	})

	t.Run("service name is applied when provided", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData: []byte(`{
				"sigv4Service": "another-service"
			}`),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{
			SigV4: &sdkhttpclient.SigV4Config{},
		}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.Equal(t, "another-service", opts.SigV4.Service)
	})

	t.Run("does not modify opts when SigV4 is nil", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte("{}"),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.Nil(t, opts.SigV4)
	})

	t.Run("defaults to aps when sigv4Service is not provided", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte("{}"),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{
			SigV4: &sdkhttpclient.SigV4Config{
				AuthType:  "keys",
				Region:    "us-east-1",
				AccessKey: "test-access-key",
				SecretKey: "test-secret-key",
			},
		}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.Equal(t, "aps", opts.SigV4.Service)
	})
}

func TestNewDatasource_ForwardGrafanaUserHeader(t *testing.T) {
	t.Run("enabled when forwardGrafanaUserHeader is true", func(t *testing.T) {
		ds, err := NewDatasource(context.Background(), backend.DataSourceInstanceSettings{
			JSONData: []byte(`{"forwardGrafanaUserHeader": true}`),
		})
		require.NoError(t, err)
		require.True(t, ds.(*Datasource).forwardGrafanaUser)
	})

	t.Run("disabled when forwardGrafanaUserHeader is false", func(t *testing.T) {
		ds, err := NewDatasource(context.Background(), backend.DataSourceInstanceSettings{
			JSONData: []byte(`{"forwardGrafanaUserHeader": false}`),
		})
		require.NoError(t, err)
		require.False(t, ds.(*Datasource).forwardGrafanaUser)
	})

	t.Run("disabled when forwardGrafanaUserHeader is not provided", func(t *testing.T) {
		ds, err := NewDatasource(context.Background(), backend.DataSourceInstanceSettings{
			JSONData: []byte("{}"),
		})
		require.NoError(t, err)
		require.False(t, ds.(*Datasource).forwardGrafanaUser)
	})
}

func TestForwardHeaderMiddleware(t *testing.T) {
	roundTrip := func(mw sdkhttpclient.Middleware, setup func(*http.Request)) *http.Request {
		var captured *http.Request
		final := sdkhttpclient.RoundTripperFunc(func(req *http.Request) (*http.Response, error) {
			captured = req
			return &http.Response{StatusCode: http.StatusOK, Body: http.NoBody}, nil
		})
		req, _ := http.NewRequest(http.MethodGet, "http://example.com", nil)
		if setup != nil {
			setup(req)
		}
		_, err := mw.CreateMiddleware(sdkhttpclient.Options{}, final).RoundTrip(req)
		require.NoError(t, err)
		return captured
	}

	t.Run("sets the header on the outgoing request", func(t *testing.T) {
		req := roundTrip(forwardHeaderMiddleware(grafanaUserHeader, "alice"), nil)
		require.Equal(t, "alice", req.Header.Get(grafanaUserHeader))
	})

	t.Run("does not overwrite an existing header", func(t *testing.T) {
		req := roundTrip(forwardHeaderMiddleware(grafanaUserHeader, "alice"), func(r *http.Request) {
			r.Header.Set(grafanaUserHeader, "existing")
		})
		require.Equal(t, "existing", req.Header.Get(grafanaUserHeader))
	})
}
