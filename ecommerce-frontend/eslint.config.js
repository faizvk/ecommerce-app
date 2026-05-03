import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),

  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // PascalCase identifiers (`{ icon: Icon }`, `as: Tag = "div"`, etc.) are JSX
      // components — ESLint without eslint-plugin-react doesn't see `<Icon />` as a use,
      // so we ignore them by name pattern.
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^(_|[A-Z])",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // The newer eslint-plugin-react-hooks ships advisory rules (v7+) that fire on
      // many idiomatic patterns (e.g. setState-on-mount, Date.now() in useState init,
      // closure-captured timeout refs). Keep them as warnings rather than blocking
      // CI on stylistic guidance — useful signal, not a release blocker.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
    },
  },

  // Test files — add vitest globals so beforeEach / describe / it / expect resolve.
  {
    files: [
      "src/test/**/*.{js,jsx}",
      "src/**/*.test.{js,jsx}",
      "src/**/*.spec.{js,jsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest exposes these via `globals: true` in vite.config.js
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
      },
    },
  },
]);
