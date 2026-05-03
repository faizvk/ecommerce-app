import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off", // we explicitly use a logger; raw console only allowed in scripts/
      "prefer-const": "warn",
      "eqeqeq": ["warn", "smart"],
      "no-var": "error",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
  {
    ignores: ["node_modules/**", "scripts/**", "tests/**/fixtures/**"],
  },
];
