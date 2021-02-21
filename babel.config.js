module.exports = {
  ignore: ['node_modules/**/*'],
  plugins: ['@babel/plugin-proposal-private-methods'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: true,
          browsers: '> 0.25%, not dead'
        }
      }
    ],
    '@babel/preset-typescript',
  ]
}
