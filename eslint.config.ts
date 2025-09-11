import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import type { TSESLint } from "@typescript-eslint/utils";

export default tseslint.config([
  {
    ignores: ["dist/**/*"]
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"] as TSESLint.FlatConfig.Config,
      reactRefresh.configs.vite as TSESLint.FlatConfig.Config,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: { react },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React recommended rules (manually added since we can't import the config)
      "react/display-name": "error",
      "react/jsx-key": "error",
      "react/jsx-no-comment-textnodes": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-vars": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/no-deprecated": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-unescaped-entities": "error",
      "react/no-unknown-property": "error",
      "react/no-unsafe": "warn",
      "react/prop-types": "error",
      "react/require-render-return": "error",
      
      // Custom overrides
      "react/jsx-props-no-spreading": ["off"],
      "react/function-component-definition": ["off"],
      "no-underscore-dangle": ["off"],
      "react/no-array-index-key": ["warn"],
      "react/require-default-props": ["off"],
      "jsx-a11y/click-events-have-key-events": ["off"],
      "no-use-before-define": ["error", { functions: false, classes: false }],
      "no-promise-executor-return": ["off"],
      "no-nested-ternary": ["off"],
      "jsx-a11y/media-has-caption": ["off"],
      "consistent-return": ["off"],
      "object-curly-spacing": ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "max-len": [
        "error",
        {
          code: 120, // Max line length
          ignoreComments: true, // Don't count comments
          ignoreStrings: true, // Don't count long strings
          ignoreTemplateLiterals: true, // Don't count template literals
          ignoreUrls: true, // Don't count URLs
        },
      ],
    },
  },
]);
