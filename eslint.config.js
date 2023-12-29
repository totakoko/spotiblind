import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    formatters: true,
    jsonc: false,
    rules: {
      'curly': [2, 'all'],
      'style/brace-style': [
        2,
        '1tbs',
        {
          allowSingleLine: true,
        },
      ],
    },
  },
)
