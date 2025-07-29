import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react';  
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';              
import { globalIgnores } from 'eslint/config'


export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      reactRecommended,
      reactJsxRuntime
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: { react },
    rules: {
      "react/jsx-uses-react": ["off"],
      "react/react-in-jsx-scope": ["off"],
      "react/jsx-props-no-spreading": ["off"],
      "react/function-component-definition": ["off"],
      "no-underscore-dangle": ["off"],
      "react/no-array-index-key": ["warn"],
      "react/require-default-props": ["off"],
      "jsx-a11y/click-events-have-key-events": ["off"],
      "no-use-before-define": ["error", { "functions": false, "classes": false }],
      "no-promise-executor-return": ["off"],
      "no-nested-ternary": ["off"],
      "jsx-a11y/media-has-caption": ["off"],
      "consistent-return": ["off"],
      'object-curly-spacing': ['error', 'always'],
      'react/jsx-key': ['error'],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
    },
  },
])
