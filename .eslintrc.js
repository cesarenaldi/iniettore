module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'jest'
  ],
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error']
  },
  ignorePatterns: [
    '**/dist/*'
  ]
}
