import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/vendor/**',
      '**/assets/**',
      'graphify-out/**',
      'archive/**',
      '**/*.vue',
      'apps/mp/src/manifest.json',
      'apps/mp/src/pages.json',
    ],
  },
  js.configs.recommended,
  {
    files: [
      'packages/core/**/*.js',
      'apps/web/src/**/*.js',
      'apps/web/serve.mjs',
      'apps/web/tools/*.mjs',
      'apps/mp/src/**/*.js',
      '**/*.mjs',
    ],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        uni: 'readonly', // uni-app 运行时全局
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
      eqeqeq: 'off',
      'no-constant-condition': 'off',
    },
  },
];
