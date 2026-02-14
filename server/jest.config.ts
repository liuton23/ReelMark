import type { Config } from 'jest';

const tsJestConfig = {
  diagnostics: false, // Type checking done separately via tsc
};

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**',
    '!src/__mocks__/**',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/unit/**/*.test.ts'],
      clearMocks: true,
      transform: {
        '^.+\\.ts$': ['ts-jest', tsJestConfig],
      },
    },
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.ts'],
      clearMocks: true,
      transform: {
        '^.+\\.ts$': ['ts-jest', tsJestConfig],
      },
    },
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/e2e/**/*.test.ts'],
      clearMocks: true,
      transform: {
        '^.+\\.ts$': ['ts-jest', tsJestConfig],
      },
    },
  ],
};

export default config;
