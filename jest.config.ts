import type { Config } from 'jest'

const config: Config = {
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@constants/(.*)$': '<rootDir>/src/lambda/constants/$1',
    '^@lambda/(.*)$': '<rootDir>/src/lambda/$1',
    '^@utils/(.*)$': '<rootDir>/src/lambda/utils/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1'
  },
}
export default config