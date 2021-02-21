module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: {
        strictBindCallApply: true
      }
    }
  },
  testEnvironment: 'node',
  coverageDirectory: './reports',
  coverageReporters: [
    'json',
    'lcov',
    'text'
  ]
}
