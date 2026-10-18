import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // public/ obsahuje vygenerované soubory z Godotu, .wrangler dočasné soubory z `wrangler dev`.
  globalIgnores(['**/dist/**', '**/node_modules/**', 'Afroxik.com/vite.config.js', 'Afroxik.com/public/**', '.wrangler/**']),
  // Skripty pro Node (import hry, optimalizace obrázků).
  {
    files: ['Afroxik.com/scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{js,jsx}'],
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
      'react-refresh/only-export-components': 'off',
    },
  },
])
