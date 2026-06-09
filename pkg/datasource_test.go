package main

import (
	"context"
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

func TestExtendClientOpts_ForwardHTTPHeaders(t *testing.T) {
	t.Run("enables forwarding when oauthPassThru is true", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"oauthPassThru": true}`),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.True(t, opts.ForwardHTTPHeaders)
	})

	t.Run("disables forwarding when oauthPassThru is false", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"oauthPassThru": false}`),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.False(t, opts.ForwardHTTPHeaders)
	})

	t.Run("disables forwarding when oauthPassThru is not provided", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte("{}"),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.False(t, opts.ForwardHTTPHeaders)
	})

	t.Run("enables forwarding alongside SigV4 configuration", func(t *testing.T) {
		settings := backend.DataSourceInstanceSettings{
			JSONData:                []byte(`{"oauthPassThru": true, "sigv4Service": "aps"}`),
			DecryptedSecureJSONData: map[string]string{},
		}
		opts := &sdkhttpclient.Options{SigV4: &sdkhttpclient.SigV4Config{}}
		err := extendClientOpts(context.Background(), settings, opts, log.NewNullLogger())
		require.NoError(t, err)
		require.True(t, opts.ForwardHTTPHeaders)
		require.Equal(t, "aps", opts.SigV4.Service)
	})
}
