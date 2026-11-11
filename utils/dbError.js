// Mengubah error koneksi PostgreSQL/Sequelize menjadi pesan yang mudah dipahami.
const config = require('../config');

const describeDbError = (err) => {
  const { host, port, name, user } = config.db;
  const kode =
    (err.original && err.original.code) || (err.parent && err.parent.code) || err.code;
  const pesan = String(err.message || '');

  if (kode === 'ECONNREFUSED' || /ECONNREFUSED/.test(pesan)) {
    return (
      `Tidak dapat terhubung ke PostgreSQL di ${host}:${port}.\n` +
      '        Pastikan PostgreSQL sudah berjalan (service "postgresql" di Services Windows)\n' +
      '        dan nilai DB_HOST / DB_PORT di file .env sudah benar.'
    );
  }
  if (kode === '28P01') {
    return `Password untuk user "${user}" salah. Periksa DB_PASSWORD di file .env (salin dari .env.example bila belum ada).`;
  }
  if (kode === '28000') {
    return `User "${user}" tidak dikenali oleh PostgreSQL. Periksa DB_USER di file .env.`;
  }
  if (kode === '3D000') {
    return `Database "${name}" belum ada dan gagal dibuat otomatis. Buat manual di pgAdmin atau jalankan: CREATE DATABASE ${name};`;
  }
  if (kode === 'ENOTFOUND') {
    return `Host "${host}" tidak ditemukan. Periksa DB_HOST di file .env.`;
  }
  return `Gagal menyiapkan database: ${pesan}`;
};

module.exports = { describeDbError };