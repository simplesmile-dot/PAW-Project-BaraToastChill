// Konfigurasi aplikasi. Nilai bisa diubah lewat environment variable.
module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  appName: 'ChatBot Bara Toast & Chill',
  version: '1.0.0',
};
