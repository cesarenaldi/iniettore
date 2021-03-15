// @ts-check
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: {
        strictBindCallApply: true,
        esModuleInterop: true,
        jsx: 'react-jsx'
      }
    }
  },
  testEnvironment: 'jsdom',
  coverageDirectory: './reports',
  collectCoverageFrom: [
    '**/src/**',
    '!**/dist/**',
    '!**/node_modules/**'
  ]
}
