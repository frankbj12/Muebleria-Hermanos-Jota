import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  // 1. Le decimos que carpetas ignorar (reemplaza al archivo .eslintignore en este nuevo estandar)
  {
    ignores: ['node_modules', 'dist', 'build'],
  },
  // 2. Aplicamas la configuracion que unifica ESLint con Prettier
  eslintPluginPrettierRecommended,
];
