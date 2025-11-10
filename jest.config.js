import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config */
const config = {
  // Load environment variables BEFORE tests
  setupFiles: ['<rootDir>/jest.env.setup.js'],
  
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.jsx',
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/src/**/*.test.jsx',
  ],
  
  // Use node environment for integration tests
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!src/app/**/layout.js',
    '!src/app/**/page.module.css',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: '<rootDir>/coverage',
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    // Mock next-auth to fix ESM import issues
    '^next-auth$': '<rootDir>/tests/__mocks__/next-auth.js',
    '^next-auth/providers/credentials$': '<rootDir>/tests/__mocks__/next-auth/providers/credentials.js',
    '^next-auth/providers/google$': '<rootDir>/tests/__mocks__/next-auth/providers/google.js',
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/unit/models/', // Models need MongoDB - will test via integration tests
  ],
  
  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    '/node_modules/(?!(bson|mongodb|mongoose|@babel|next-auth|@auth)/)',
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
