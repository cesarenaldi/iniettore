import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.js',
  output: {
    file: 'cjs/' + process.env.LERNA_PACKAGE_NAME + '.js',
    intro: `/**
 * ${process.env.LERNA_PACKAGE_NAME}
 * Build time: ${new Date().toISOString()}
 * @preserve
 */\n`,
    format: 'cjs',
    strict: false,
    exports: 'named'
  },
  treeshake: true,
  plugins: [
    commonjs(),
    babel({
      configFile: process.env.LERNA_ROOT_PATH + '/babel.config.js',
      exclude: 'node_modules/**'
    }),
    terser({
      output: {
        comments: /@preserve/
      }
    })
  ]
}
