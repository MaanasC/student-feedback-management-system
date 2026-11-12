import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'scratch']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['server/**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
])
