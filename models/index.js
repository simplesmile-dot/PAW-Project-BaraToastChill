// Titik masuk lapisan model: menghubungkan Sequelize, membuat tabel, dan mengisi data awal.
const { sequelize, ensureDatabase } = require('../config/database');
const Produk = require('./Produk');
const seedProduk = require('../config/seed');

const initDatabase = async () => {
  // 1. Buat database bila belum ada (kegagalan sebenarnya akan muncul di authenticate)
  try {
    await ensureDatabase();
  } catch (err) {
    // diabaikan dulu, authenticate() di bawah akan melaporkan masalah koneksi yang jelas
  }

  // 2. Uji koneksi
  await sequelize.authenticate();

  // 3. Buat tabel bila belum ada; data awal hanya dimasukkan saat tabel pertama kali dibuat
  const tabelSudahAda = await sequelize.getQueryInterface().tableExists('produk');
  await sequelize.sync();
  if (!tabelSudahAda) {
    await Produk.bulkCreate(seedProduk);
  }
};

module.exports = { sequelize, Produk, initDatabase };