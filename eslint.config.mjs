import * as emotion from "@emotion/eslint-plugin";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import _import from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import lodash from "eslint-plugin-lodash";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const grafanaConfig = require("@grafana/eslint-config/flat");

export default defineConfig([globalIgnores([
    "**/.git",
    "**/.github",
    "**/.yarn",
    "**/build",
    "**/compiled",
    "data",
    "**/deployment_tools_config.json",
    "devenv",
    "**/dist",
    "e2e/tmp",
    "**/node_modules",
    "pkg",
    "public/lib/monaco",
    "scripts/grafana-server/tmp",
    "**/vendor",
    "**/*.gen.ts",
    "public/locales/_build/",
    "public/locales/**/*.js",
    "packages/grafana-ui/src/components/Icon/iconBundle.ts",
    "./.config",
]),
  ...fixupConfigRules(grafanaConfig),
  {
    plugins: {
        "@emotion": fixupPluginRules(emotion),
        lodash,
        jest,
        import: fixupPluginRules(_import),
    },

    settings: {
        "import/external-module-folders": ["node_modules", ".yarn"],
    },

    rules: {
        "react/prop-types": "off",

        "react/no-unknown-property": ["error", {
            ignore: ["css"],
        }],

        "@emotion/jsx-import": "error",
        "lodash/import-scope": [2, "member"],
        "jest/no-focused-tests": "error",

        "import/order": ["error", {
            groups: [["builtin", "external"], "internal", "parent", "sibling", "index"],
            "newlines-between": "always",

            alphabetize: {
                order: "asc",
            },
        }],

        "no-restricted-imports": ["error", {
            paths: [{
                name: "react-redux",
                importNames: ["useDispatch", "useSelector"],
                message: "Please import from app/types instead.",
            }, {
                name: "react-i18next",
                importNames: ["Trans", "t"],
                message: "Please import from app/core/internationalization instead",
            }, {
                name: "@grafana/e2e",
                message: "@grafana/e2e is deprecated. Please import from ./e2e/utils instead",
            }],
        }],

        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": ["error"],
    },
},
  ...fixupConfigRules([jsxA11Y.flatConfigs.recommended]).map(config => ({
    ...config,
    files: ["**/*.tsx"],
    ignores: ["**/*.{spec,test}.tsx"],
  })),
  {
    files: ["**/*.tsx"],
    ignores: ["**/*.{spec,test}.tsx"],

    rules: {
        "jsx-a11y/no-autofocus": ["error", {
            ignoreNonDOM: true,
        }],

        "jsx-a11y/label-has-associated-control": ["error", {
            controlComponents: ["NumberInput"],
            depth: 2,
        }],
    },
}]);
