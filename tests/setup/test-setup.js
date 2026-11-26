// Setup global sebelum menjalankan seluruh test suite Vitest
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

process.env.NODE_ENV = 'test';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
process.env.ADMIN_SECRET = process.env.ADMIN_SECRET || 'bara-toast-chill-test-secret';

afterEach(() => {
  vi.restoreAllMocks();
});
