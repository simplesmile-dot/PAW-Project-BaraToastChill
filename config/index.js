// Konfigurasi aplikasi. Nilai dibaca dari file .env supaya informasi sensitif
// (seperti password database) tidak ditulis langsung di dalam kode.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  appName: 'ChatBot Bara Toast & Chill',
  version: '1.1.0',
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    secret: process.env.ADMIN_SECRET || 'bara-toast-chill-dev-secret',
  },
  store: {
    name: 'Bara Toast & Chill',
    hours: 'Setiap hari, 16.00 – 23.00 WIB',
    address: 'Jl. Brawijaya No. 45, Yogyakarta',
    phone: '0812-3456-7890',
    instagram: '@baratoastchill',
    paymentNote: 'Pembayaran dilakukan langsung di kasir toko (Tunai / QRIS di tempat).',
  },
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