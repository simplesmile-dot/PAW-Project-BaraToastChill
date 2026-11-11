// Konfigurasi aplikasi. Nilai dibaca dari file .env supaya informasi sensitif
// (seperti password database) tidak ditulis langsung di dalam kode.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  appName: 'ChatBot Bara Toast & Chill',
  version: '1.1.0',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'bara_toast_chill',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
};