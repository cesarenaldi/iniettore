import ts from '@rollup/plugin-typescript'
import typescript from 'typescript'

export default [
  'iniettore'
].map(name => ({
  input: `packages/${name}/src/index.ts`,
  output: {
    file: `packages/${name}/dist/${name}.js`,
    intro: `/**
 * ${name}
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
      typescript
      // https://github.com/ezolenko/rollup-plugin-typescript2/issues/37
      // include: [
      //   './packages/shared/**/*.ts'
      // ]
    })
  ]
}))
