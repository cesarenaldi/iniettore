import ts from '@rollup/plugin-typescript'
import typescript from 'typescript'

export default [
  'iniettore'
].map(name => ({
  input: `packages/${name}/src/index.ts`,
  output: [
    {
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
    }
    //     {
    //       file: `packages/${name}/dist/${name}.esm.js`,
    //       intro: `/**
    //  * ${name}
    //  * Build time: ${new Date().toISOString()}
    //  * @preserve
    //  */\n`,
    //       format: 'es',
    //       strict: false,
    //       sourcemap: true,
    //       exports: 'named'
    //     }
  ],
  treeshake: true,
  plugins: [
    ts({
      typescript,

      tsconfig: `packages/${name}/tsconfig.json`

      // rootDir: `packages/${name}/src`,
      // outDir: `packages/${name}/dist`,
    })
  ]
}))
