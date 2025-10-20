import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import { configs } from '@eslint/js';
import globals from 'globals';

module.exports = [
  configs.recommended,
  {
    languageOptions: { globals: globals.node },
    env: { node: true, es2021: true },
  },
  // Prettier and custom rules
  {
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-parens': ['error', 'always'],
    },
  },
  eslintConfigPrettier,
];
