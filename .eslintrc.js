module.exports = {
  root: true,
  extends: [
    'standard-with-typescript',
    'plugin:vue/vue3-recommended',
    'plugin:import/recommended',
    'plugin:import/warnings',
    'plugin:import/typescript'
    // '@vue/standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.vue']
  },

  // parserOptions: {
  //   parser: 'babel-eslint'
  // },
  rules: {
    'vue/max-attributes-per-line': 0
  },
  //   'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  //   'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  // },

  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    }
  ]

  // overrides: [
  //   {
  //     files: [
  //       '**/__tests__/*.{j,t}s?(x)',
  //       '**/tests/unit/**/*.spec.{j,t}s?(x)'
  //     ],
  //     env: {
  //       jest: true
  //     }
  //   }
  // ]
}
