## Getting started

### Backend

1. Update [Grafana plugin SDK for Go](https://grafana.com/docs/grafana/latest/developers/plugins/backend/grafana-plugin-sdk-for-go/) dependency to the latest minor version:

   ```bash
   go get -u github.com/grafana/grafana-plugin-sdk-go
   go mod tidy
   ```

2. Build backend plugin binaries for Linux, Windows and Darwin:

   ```bash
   mage -v
   ```

3. List all available Mage targets for additional commands:

   ```bash
   mage -l
   ```

## Data Source Configuration Schema

`pkg/schema/dsconfig.json` is the **single source of truth** for the data source's
configuration surface — every field a user can set, where it is stored (`root`,
`jsonData`, `secureJsonData`), its type, validation rules and UI hints. It is consumed by
provisioning tooling, documentation and automation.

The schema format is defined and documented by [`grafana/dsconfig`](https://github.com/grafana/dsconfig/tree/main/dsconfig):

- [README](https://github.com/grafana/dsconfig/tree/main/dsconfig#readme) — concepts and a worked example for each field shape (root / jsonData / secret / array / virtual), plus current gaps and limitations.
- [`schema.md`](https://github.com/grafana/dsconfig/blob/main/dsconfig/schema.md) — full property reference.
- [`schema.json`](https://github.com/grafana/dsconfig/blob/main/dsconfig/schema.json) — the JSON Schema `dsconfig.json` validates against. It is pinned via the `$schema` key at the top of our file, so editors autocomplete from it; bump that URL when you bump `github.com/grafana/dsconfig/schema` in `go.mod`.

The rest of this section covers only what is specific to this repository.

### Layout

| File in `pkg/schema/` | Description |
| --------------------- | ----------- |
| `dsconfig.json` | Source of truth — **edit this** |
| `dsconfig_test.go` | Wires the schema into the shared conformance suite; also holds `SecureKeys` |
| `*.gen.json` | Generated artifacts — **never hand-edit**; `npm run build` copies them into `dist/schema/` via `webpack.config.ts` |

`pkg/models/settings.go` holds `models.DatasourceSettings`, the Go struct the conformance
suite compares the schema against. It embeds the shared `PromOptions` settings model from
`grafana-prometheus-datasource/pkg/promlib` and adds this plugin's own fields (the
SigV4-prefixed auth fields, `keepCookies`/`timeout`, and the custom toggles).

### Adding a new settings option

1. **Declare the field** in `pkg/schema/dsconfig.json` under `fields`, and add its `id` to
   the appropriate `groups[].fieldRefs` entry. Field ids follow the `<target>_<key>`
   convention, e.g. `jsonData_sigV4Region`.
2. **Add the matching Go field** to `models.DatasourceSettings` in `pkg/models/settings.go`
   with a json tag equal to the schema `key`. This parity is enforced in both directions — a
   field in the schema but not the struct (or vice versa) fails the test suite. Secrets
   (`target: secureJsonData`) are the exception: they get no struct field, but their key
   must be added to `SecureKeys` in `pkg/schema/dsconfig_test.go`.

   Note that `DatasourceSettings` embeds the shared `PromOptions` settings model, so it
   already carries several fields this plugin's editor never renders (see the
   `dsconfig.json` `instructions` array). Those stay in the schema tagged `backend-only` or
   `frontend-hidden` for struct parity — don't remove them just because the editor doesn't
   show them.
3. **Regenerate the artifacts** and commit them with your change:

   ```bash
   go generate ./pkg/schema/...
   ```

4. **Verify**:

   ```bash
   go test ./pkg/schema/...
   ```

This repo does not ship provisioning examples yet, so `settings.examples.gen.json` is
empty. To add them, set `SettingsExamples` on the `schema.PluginUnderTest` value in
`pkg/schema/dsconfig_test.go` — one worked configuration per auth type is the usual
shape. Use placeholders like `REPLACE_WITH_PASSWORD`, never real credentials.

### When the conformance suite fails

Most failures are self-explanatory from the assertion message. The three you are most
likely to hit:

- `SchemaArtifactInSync` — a `.gen.json` file has drifted. Run `go generate ./pkg/schema/...` and commit the result.
- `JSONDataMatchesStruct` / `JSONDataTypesMatchStruct` — the schema and `models.DatasourceSettings` disagree on keys or types. Update whichever side is behind.
- `SecureValuesMatchLoadSettings` — the schema's `secureJsonData` fields and `SecureKeys` disagree.

### Frontend

1. Install dependencies

   ```bash
   npm install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   npm run dev
   ```

3. Build plugin in production mode

   ```bash
   npm run build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes, requires git init first
   npm test

   # Exits after running all the tests
   npm run test:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   npm run server:configured
   ```

6. Run the E2E tests (using Playwright and @grafana/plugin-e2e)

   Smoke tests run against the local Prometheus in `docker-compose.yaml`. Tests tagged
   `@aws` exercise the AMP workspace provisioned for the Data Sources team's AWS test
   environment (Vault path `amazonManagedPrometheus`). In CI, Vault injects credentials
   into the provisioned datasource. Locally, export those credentials before starting
   Grafana if you want the live suite to run (otherwise `@aws` tests are skipped).

   ```bash
   # Install Playwright browsers
   npx playwright install --with-deps

   # Optional — required for @aws / live AMP tests (otherwise they are skipped)
   export DS_INSTANCE_URL=<amp-workspace-url>
   export DS_INSTANCE_SIGV4_REGION=<region>
   export DS_INSTANCE_SIGV4_ACCESS_KEY=<access-key>
   export DS_INSTANCE_SIGV4_SECRET_KEY=<secret-key>

   # Spins up Grafana + a local Prometheus (defaults used when the env vars above are unset)
   npm run server:configured

   # Starts the e2e tests
   npm run e2e
   ```

   Fork PRs run `playwright.smoke.config.ts`, which excludes `@aws` tests because Vault
   secrets are unavailable to untrusted workflows.

7. Run the linter

   ```bash
   npm run lint

   # or

   npm run lint:fix
   ```

## Releasing

1. Update the version number in the `package.json` file.
2. Update the `CHANGELOG.md` with the changes contained in the release.
3. Make a PR for the changes.
4. Once merged, follow the release process in the Github Actions tab, instructions [here](https://enghub.grafana-ops.net/docs/default/component/grafana-plugins-platform/plugins-ci-github-actions/010-plugins-ci-github-actions/#cd_1)
