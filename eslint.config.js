// ESLint Configuration File
// This file configures ESLint, the code linting tool that helps maintain code quality
// ESLint checks for potential errors, enforces coding standards, and suggests improvements

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

// ESLint configuration object
// This tells ESLint which rules to apply and which files to check
export default tseslint.config([
  // Global ignores - files and directories to skip during linting
  globalIgnores(['dist']),
  {
    // Apply rules to TypeScript and TypeScript React files
    files: ['**/*.{ts,tsx}'],
    // Extend recommended configurations from various ESLint plugins
    extends: [
      js.configs.recommended,                    // JavaScript recommended rules
      tseslint.configs.recommended,              // TypeScript recommended rules
      reactHooks.configs['recommended-latest'],  // React Hooks rules
      reactRefresh.configs.vite,                 // React Refresh rules for Vite
    ],
    // Language options - specify JavaScript version and global variables
    languageOptions: {
      ecmaVersion: 2020,        // Use ES2020 features
      globals: globals.browser, // Browser global variables (window, document, etc.)
    },
  },
])
