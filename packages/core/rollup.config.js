import ts from '@rollup/plugin-typescript'
import pkg from './package.json'
// import ts from 'rollup-plugin-typescript2'
import typescript from 'typescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/core.js',
    intro: `/**
 * @iniettore/core
 * Build time: ${new Date().toISOString()}
 * @preserve
 */\n`,
    format: 'cjs',
    strict: false,
    sourcemap: true,
    exports: 'named'
  },
  treeshake: true,
  plugins: [
    ts({
      typescript,
      tsconfig: './tsconfig.build.json'
    })
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ]
}
