/// <reference types="node" />
import { expect, test } from '@grafana/plugin-e2e';
import type { Page, Response } from '@playwright/test';

const PLUGIN_TYPE = 'grafana-amazonprometheus-datasource';
const PROVISIONED_FILE = 'datasources.yml';
const LOCAL_DEFAULT_UID = 'grafana-amazonprometheus';
// Managed datasource on DSE2EDEV from data-sources infra
// (createDataSource('amazon-managed-prometheus', ...) → amazon-managed-prometheus-ds-m).
const CLOUD_DEFAULT_UID = 'amazon-managed-prometheus-ds-m';

// GRAFANA_URL is set only by the Cloud cron workflow (playwright-cloud).
const isCloudRun = !!process.env.GRAFANA_URL;

function isLocalPrometheusUrl(url: string | undefined): boolean {
  if (!url) {
    return true;
  }
  return url.includes('prometheus:9090') || url.includes('localhost') || url.includes('127.0.0.1');
}

// A developer machine is the only place a missing-credentials skip is allowed. Skipping in CI or
// on the nightly Cloud run would turn a broken Vault injection into a green report, so those lanes
// deliberately fall through to the assertions and fail instead.
//
// The provisioned URL is only a reliable credential signal locally. Trusted CI injects
// DS_INSTANCE_* into Grafana through docker-compose, not into the Playwright process, so
// readProvisionedDataSource expands the placeholder to an empty string there and would look
// uncredentialed even when the datasource is fully configured. Hence the early return.
async function skipOnlyLocallyWithoutLiveCredentials(
  readProvisionedDataSource: (options: { fileName: string }) => Promise<{ url?: string }>
): Promise<void> {
  if (isCloudRun || process.env.CI) {
    return;
  }

  const ds = await readProvisionedDataSource({ fileName: PROVISIONED_FILE });
  test.skip(
    isLocalPrometheusUrl(ds.url),
    'Live AMP credentials required. Export DS_INSTANCE_* before yarn server (see CONTRIBUTING.md)'
  );
}

// Waits for the first /api/ds/query response where results.A.frames is an array.
// response.json() must be called inside the predicate while the CDP body is still live.
async function waitForMainQueryResponse(page: Page): Promise<{ response: Response; body: any }> {
  let body: any;
  const response = await page.waitForResponse(async (r: Response) => {
    if (!r.url().includes('/api/ds/query') || !r.ok()) {
      return false;
    }
    const b = await r.json().catch(() => null);
    if (!Array.isArray(b?.results?.A?.frames)) {
      return false;
    }
    body = b;
    return true;
  });
  return { response, body };
}

function exploreUrl(uid: string, expr: string): string {
  const panes = JSON.stringify({
    explore: {
      datasource: uid,
      queries: [
        {
          refId: 'A',
          expr,
          datasource: { type: PLUGIN_TYPE, uid },
        },
      ],
      range: { from: 'now-1h', to: 'now' },
    },
  });
  return `/explore?orgId=1&schemaVersion=1&panes=${encodeURIComponent(panes)}`;
}

test.describe('Live AMP against real workspace', () => {
  // Live AMP health checks / queries can exceed the default 15s suite timeout.
  test.describe.configure({ mode: 'serial', timeout: 60000 });

  // Fork PRs use playwright.smoke.config.ts (grepInvert /@aws/) so these never run there.
  test.beforeEach(async ({ readProvisionedDataSource }) => {
    await skipOnlyLocallyWithoutLiveCredentials(readProvisionedDataSource);
  });

  test(
    'provisioned datasource passes health check',
    { tag: '@aws' },
    async ({ readProvisionedDataSource, request }) => {
      // On DSE2EDEV the local provisioning file is not applied; managed DS query covers connectivity.
      test.skip(isCloudRun, 'Ad-hoc provisioned health check is not available on DSE2EDEV');

      const ds = await readProvisionedDataSource({ fileName: PROVISIONED_FILE });

      // Probe the health API directly — Save & test on an editable provisioned DS can
      // rewrite secure fields and is flaky; the health endpoint uses the stored credentials.
      const response = await request.get(`/api/datasources/uid/${ds.uid}/health`);
      const body = await response.json();
      expect(body, JSON.stringify(body)).toMatchObject({ status: 'OK' });
    }
  );

  test(
    'PromQL query against live AMP returns frames',
    { tag: '@aws' },
    async ({ page, readProvisionedDataSource }) => {
      let uid = process.env.DS_E2E_UID || (isCloudRun ? CLOUD_DEFAULT_UID : LOCAL_DEFAULT_UID);

      if (!isCloudRun) {
        const ds = await readProvisionedDataSource({ fileName: PROVISIONED_FILE });
        uid = ds.uid || LOCAL_DEFAULT_UID;
      }

      // `up` is scraped into AMP by the agentless scraper on the provisioned workspace.
      const responsePromise = waitForMainQueryResponse(page);
      await page.goto(exploreUrl(uid, 'up'));
      const { response, body } = await responsePromise;

      expect(response.ok()).toBe(true);
      expect(body.results?.A?.error).toBeUndefined();
      expect(body.results?.A?.frames?.length).toBeGreaterThan(0);
    }
  );
});
