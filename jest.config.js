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
  collectCoverageFrom: [
    '**/src/**',
    '!**/dist/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 83,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
}
