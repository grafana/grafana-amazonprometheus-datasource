package main

import (
	"context"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/stretchr/testify/require"
)

type lifecycleResourceSender struct{}

func (lifecycleResourceSender) Send(*backend.CallResourceResponse) error { return nil }

func TestDatasourceUsesFactorySettingsAndDisposesConnections(t *testing.T) {
	closed := make(chan struct{}, 1)
	server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"status":"success","data":[]}`))
	}))
	server.Config.ConnState = func(_ net.Conn, state http.ConnState) {
		if state == http.StateClosed {
			closed <- struct{}{}
		}
	}
	server.Start()
	defer server.Close()
	i, err := NewDatasource(context.Background(), backend.DataSourceInstanceSettings{
		URL: server.URL, JSONData: []byte(`{}`),
	})
	require.NoError(t, err)
	ds := i.(*Datasource)
	t.Cleanup(ds.Dispose)
	// Only the factory receives datasource settings. Requests reuse that client.
	require.NoError(t, ds.CallResource(context.Background(), &backend.CallResourceRequest{
		Path: "api/v1/labels", URL: "api/v1/labels", Method: http.MethodGet,
	}, lifecycleResourceSender{}))
	select {
	case <-closed:
		t.Fatal("connection closed before disposal")
	default:
	}
	ds.Dispose()
	select {
	case <-closed:
	case <-time.After(5 * time.Second):
		t.Fatal("Dispose did not close the idle connection")
	}
}

func TestNewDatasourceRejectsInvalidSettings(t *testing.T) {
	i, err := NewDatasource(context.Background(), backend.DataSourceInstanceSettings{
		JSONData: []byte(`{"httpMethod":"invalid"}`),
	})
	require.ErrorContains(t, err, "invalid httpMethod")
	require.Nil(t, i)
}
