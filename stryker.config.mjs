/**
 * Stryker Configuration for @syntrojs/singleton
 *
 * Mutation testing configuration for the singleton registry
 */

/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  testRunner: 'vitest',
  
  // Use 'off' for less resource-intensive analysis
  coverageAnalysis: 'off',

  // Mutate only source code (very simple for this package)
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],

  // Vitest config
  vitest: {
    configFile: 'vitest.config.ts',
  },

  // Thresholds for CI/CD
  thresholds: {
    high: 80,   // High target for simple code
    low: 60,    // Minimum acceptable score
    break: 50,  // Break build below this
  },

  // Minimal reporters to reduce I/O overhead
  reporters: ['progress', 'clear-text'],

  // HTML report output
  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },

  // JSON report for CI/CD
  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json',
  },

  // Plugins
  plugins: ['@stryker-mutator/vitest-runner'],
  
  tsconfigFile: 'tsconfig.json',

  // Conservative performance settings
  concurrency: 2,
  timeoutMS: 20000,
  timeoutFactor: 1.5,

  // Disable mutations that are rarely useful
  disableTypeChecks: '{test,spec}/**/*.{js,ts}',

  // Exclude mutators that don't add value for this simple package
  mutator: {
    excludedMutations: [
      'StringLiteral', // Error messages
      'ObjectLiteral', // Config objects
    ],
  },

  // Enable incremental mode for faster subsequent runs
  incremental: true,
  incrementalFile: 'reports/mutation/stryker-incremental.json',
  
  // Additional memory management
  maxTestRunnerReuse: 50,
  cleanTempDir: true,
};

export default config;

