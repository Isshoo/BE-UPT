// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';

export default [
  // Konfigurasi dasar dari ESLint
  js.configs.recommended,

  {
    files: ['**/*.js'], // Semua file JS akan dilint
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'logs/**',
    ],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // 🔧 Style & kualitas kode
      'no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],

      // ⚙️ Express & Node best practices
      'handle-callback-err': 'warn',
      'no-new-require': 'error',
      'no-path-concat': 'error',
    },
  },
];
