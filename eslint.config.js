import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  // 1. Carpetas ignoradas
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'docs/**',
      '.agents/**',
      'client/public/**',
    ],
  },
  // 2. Opciones de lenguaje (soporte para JSX)
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  // 3. Configuración de Prettier con ESLint
  eslintPluginPrettierRecommended,
];
