import * as emotion from "@emotion/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import _import from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import lodash from "eslint-plugin-lodash";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

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
]), {
    extends: compat.extends("@grafana/eslint-config"),

    plugins: {
        "@emotion": emotion,
        lodash,
        jest,
        import: fixupPluginRules(_import),
        "jsx-a11y": jsxA11Y,
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
}, {
    files: ["**/*.tsx"],
    ignores: ["**/*.{spec,test}.tsx"],
    extends: compat.extends("plugin:jsx-a11y/recommended"),

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
