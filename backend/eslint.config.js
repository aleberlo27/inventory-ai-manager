// @ts-check
const tseslint = require('typescript-eslint');
const sonarjs = require('eslint-plugin-sonarjs');

module.exports = tseslint.config(
  {
    files: ['src/**/*.ts'],
    extends: [...tseslint.configs.recommended, sonarjs.configs.recommended],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/function-return-type': 'warn',
    },
  },
  {
    // Relax rules in test files
    files: ['tests/**/*.ts'],
    rules: {
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/no-duplicate-string': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'src/generated/**'],
  },
);
