import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
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
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Prevent console.log in production code - use logger utility instead
      'no-console': ['warn', { 
        allow: ['error', 'warn'] 
      }],
      // Enforce proper TypeScript typing
      '@typescript-eslint/no-explicit-any': 'error',
      // Enforce consistent import style (prefer 'import * as' syntax per user preference)
      // Note: This would require a custom rule or plugin, documenting intent here
    },
  },
])
