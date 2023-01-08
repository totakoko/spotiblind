module.exports = {
  root: true,
  extends: [
    'standard-with-typescript',
    'plugin:vue/vue3-recommended',
    'plugin:import/recommended',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.vue']
  },
  rules: {
    'vue/max-attributes-per-line': 0,
    'import/no-unresolved': ['error', {
      ignore: [
        '^virtual:',
        '@vue/runtime-core'
      ]
    }],
    'vue/multi-word-component-names': 0
  },

  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    {
      files: ['vite.config.ts'],
      parserOptions: {
        project: './tsconfig.node.json'
      },
      rules: {
        'import/no-unresolved': ['error', {
          ignore: ['^unplugin*/*']
        }]
      }
    }
  ]
}
