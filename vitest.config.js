const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup/test-setup.js'],
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: [
        'controllers/**/*.js',
        'services/**/*.js',
        'middlewares/**/*.js',
        'utils/**/*.js',
        'routes/**/*.js',
      ],
      exclude: [
        'node_modules/**',
        'tests/**',
        'coverage/**',
      ],
    },
  },
});
