module.exports = {
  ignore: ['node_modules/**/*'],
  plugins: ['@babel/plugin-proposal-private-methods'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 6,
          browsers: '> 0.25%, not dead'
        }
      }
    ]
  ]
}
