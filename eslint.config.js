import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // dist/public são gerados; examples/ é o protótipo (não faz parte da lib)
    ignores: [
      'dist/**',
      'public/**',
      'node_modules/**',
      'graphify-out/**',
      'coverage/**',
      '.code-review-graph/**',
      'examples/**',
    ],
  },
  js.configs.recommended,
  {
    // Convenção do projeto: prefixo _ marca variável/arg/catch intencionalmente não usado
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },
  {
    // testes rodam no Node e instalam document/window fake em globalThis
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['scripts/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
];
