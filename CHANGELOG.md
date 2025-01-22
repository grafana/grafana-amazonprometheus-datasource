# Changelog

## 1.0.5

- Update compatibility info in plugin.json in [#327](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/327)

## 1.0.4

- Dependency updates: 
  - Bump cross-spawn from 7.0.3 to 7.0.6 in the npm_and_yarn group [#294](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/294)
  - Updates github.com/grafana/grafana-aws-sdk from 0.31.3 to 0.31.4 [#298](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/298)
  - Updates github.com/grafana/grafana-plugin-sdk-go from 0.256.0 to 0.258.0 [#298](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/298)
  - Updates github.com/stretchr/testify from 1.9.0 to 1.10.0 [#298](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/298)
  - Bump github.com/grafana/grafana-plugin-sdk-go from 0.258.0 to 0.260.1 in [#302](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/302)
  - Update dependencies with create-plugin in [#305](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/305)
## 1.0.3

- Bugfix: use GetAuthSettings for env variable fallback [#289](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/289)
- Bump github.com/grafana/grafana-plugin-sdk-go from 0.251.0 to 0.256.0 in the all-dependencies group [#283](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/283)
- Bump the all-dependencies group across 1 directory with 34 updates [#281](https://github.com/grafana/grafana-amazonprometheus-datasource/pull/281)

## 1.0.2

- Bump dependencies
  - github.com/grafana/grafana-aws-sdk from v0.30.0 to v0.31.3
  - github.com/grafana/grafana-plugin-sdk-go v0.241.0 to v0.251.0
  - @grafana/aws-sdk from 0.3.3 to 0.5.0
  - @grafana/data from 11.1.0 to 11.2.2
  - @grafana/e2e-selectors from 11.1.0 to 11.2.2
  - @grafana/plugin-e2e from 1.3.2 to 1.8.3
  - @grafana/experimental from 1.7.11 to 2.1.1
  - @grafana/tsconfig from 1.3.0 to 2.0.0
  - @grafana/prometheus from 11.1.0 to 11.2.2
  - @grafana/runtime from 11.1.0 to 11.2.2
  - @grafana/schema from 11.1.0 to 11.2.2
  - @grafana/ui from 11.1.0 to 11.2.2
  - @playwright/test from 1.44.1 to 1.47.2
  - @swc/core from 1.5.25 to 1.7.28
  - @swc/helpers from 0.5.11 to 0.5.13
  - @testing-library/dom from 10.1.0 to 10.4.0
  - @types/lodash from 4.17.4 to 4.17.10
  - @typescript-eslint/eslint-plugin from 6.21.0 to 7.0.0
  - cspell from 6.13.3 to 8.14.4
  - eslint-plugin-import from 2.29.1 to 2.31.0
  - eslint-plugin-jest from 28.5.0 to 28.8.1
  - eslint-plugin-jsx-a11y from 6.8.0 to 6.10.0
  - eslint-plugin-react-hooks from 4.6.0 to 4.6.2
  - glob from 10.3.12 to 11.0.0
  - prettier from 3.3.1 to 3.3.3
  - sass from 1.77.4 to 1.79.3
  - tslib from 2.5.3 to 2.7.0
  - webpack from 5.91.0 to 5.95.0
- Update links to documentation in the Config Editor

## 1.0.1

- Fix sigv4 auth in Cloud

## 1.0.0

- Initial public release

## 0.3.0

- Rename plugin & repo

## 0.2.0 (Private release for testing)

- Initial private release of the Amazon Managed Prometheus plugin, a wrapper around [the core Prometheus datasource](https://grafana.com/docs/grafana/latest/datasources/prometheus/) that uses Amazon-specific authentication.

## 0.1.0 (Unreleased)

Initial release.
