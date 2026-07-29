/// <reference types="node" />
import { selectors } from '@grafana/e2e-selectors';
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

const hasLiveCredentials = Boolean(
  process.env.DS_INSTANCE_URL &&
    process.env.DS_INSTANCE_SIGV4_ACCESS_KEY &&
    process.env.DS_INSTANCE_SIGV4_SECRET_KEY &&
    // Local docker-compose defaults point at the in-compose Prometheus — not a live AMP workspace.
    !process.env.DS_INSTANCE_URL.includes('prometheus:9090') &&
    !process.env.DS_INSTANCE_URL.includes('localhost')
);

const DATASOURCE_UID = process.env.DS_E2E_UID || (isCloudRun ? CLOUD_DEFAULT_UID : LOCAL_DEFAULT_UID);

async function configurePDC(page: Page, networkName: string) {
  await page.getByRole('combobox', { name: 'Private data source connect' }).click();
  await page.getByText(networkName, { exact: true }).click();
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

  test.beforeEach(() => {
    test.skip(
      !hasLiveCredentials && !isCloudRun,
      'Live AMP credentials (DS_INSTANCE_*) or Cloud GRAFANA_URL required'
    );
  });

  test('save & test passes with live credentials', async ({ createDataSourceConfigPage, page }) => {
    // On DSE2EDEV, prefer the managed datasource query coverage below — ad-hoc DS
    // health checks through PDC from a fresh config page are flaky (see clickhouse e2e).
    test.skip(isCloudRun, 'Ad-hoc save & test on DSE2EDEV is covered by the managed datasource query test');
    test.skip(!hasLiveCredentials, 'DS_INSTANCE_* secrets required');

    const configPage = await createDataSourceConfigPage({ type: PLUGIN_TYPE });

    await configPage
      .getByGrafanaSelector(selectors.components.DataSource.Prometheus.configPage.connectionSettings)
      .fill(process.env.DS_INSTANCE_URL!);

    // SIGV4 auth is selected by default for AMP; fill keys + region from Vault.
    await page.getByLabel('Access Key ID').fill(process.env.DS_INSTANCE_SIGV4_ACCESS_KEY!);
    await page.getByLabel('Secret Access Key').fill(process.env.DS_INSTANCE_SIGV4_SECRET_KEY!);

    const region = process.env.DS_INSTANCE_SIGV4_REGION;
    if (region) {
      const regionField = page.getByLabel('Default Region');
      if (await regionField.isVisible().catch(() => false)) {
        await regionField.click();
        await page.getByText(region, { exact: true }).click();
      }
    }

    if (process.env.DS_PDC_NETWORK_NAME) {
      await configurePDC(page, process.env.DS_PDC_NETWORK_NAME);
    }

    const response = await configPage.saveAndTest();
    expect(response.ok()).toBe(true);
  });

  test('PromQL query against live AMP returns frames', async ({
    page,
    readProvisionedDataSource,
  }) => {
    let uid = DATASOURCE_UID;

    if (!isCloudRun) {
      test.skip(!hasLiveCredentials, 'DS_INSTANCE_* secrets required');
      // Prefer the provisioned datasource uid when available (PR CI with playwright-secrets).
      const ds = await readProvisionedDataSource({ fileName: PROVISIONED_FILE });
      uid = ds.uid || LOCAL_DEFAULT_UID;
    }

    // `up` is scraped into AMP by the agentless scraper on the provisioned workspace.
    // Falls back to an empty-but-successful result shape if the scraper is lagging —
    // we still assert HTTP OK and a frames array (no query error).
    const responsePromise = waitForMainQueryResponse(page);
    await page.goto(exploreUrl(uid, 'up'));
    const { response, body } = await responsePromise;

    expect(response.ok()).toBe(true);
    expect(body.results?.A?.error).toBeUndefined();
    expect(Array.isArray(body.results?.A?.frames)).toBe(true);
  });
});
