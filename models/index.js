// Titik masuk lapisan model: menghubungkan Sequelize, mendefinisikan relasi, membuat tabel, dan mengisi data awal.
const { sequelize, ensureDatabase } = require('../config/database');
const Produk = require('./Produk');
const Pesanan = require('./Pesanan');
const ItemPesanan = require('./ItemPesanan');
const seedProduk = require('../config/seed');

// Relasi tabel pesanan dan item_pesanan
Pesanan.hasMany(ItemPesanan, {
  foreignKey: 'pesanan_id',
  as: 'items',
  onDelete: 'CASCADE',
});
ItemPesanan.belongsTo(Pesanan, {
  foreignKey: 'pesanan_id',
  as: 'pesanan',
});
Produk.hasMany(ItemPesanan, {
  foreignKey: 'produk_id',
  as: 'itemPesanan',
  onDelete: 'SET NULL',
});
ItemPesanan.belongsTo(Produk, {
  foreignKey: 'produk_id',
  as: 'produk',
});

const seedSampleOrders = async () => {
  await sequelize.transaction(async (t) => {
    const p1 = await Pesanan.create(
      {
        nomor_pesanan: 'BTC-0001',
        nama_pelanggan: 'Rina',
        jenis_pesanan: 'Bawa pulang',
        catatan: 'Keju ekstra ya kak',
        total_harga: 41000,
        status: 'Diproses',
      },
      { transaction: t }
    );
    await ItemPesanan.bulkCreate(
      [
        {
          pesanan_id: p1.id,
          produk_id: null,
          nama_produk: 'Roti Bakar Coklat Keju',
          harga_satuan: 18000,
          jumlah: 2,
          subtotal: 36000,
        },
        {
          pesanan_id: p1.id,
          produk_id: null,
          nama_produk: 'Es Teh Manis',
          harga_satuan: 5000,
          jumlah: 1,
          subtotal: 5000,
        },
      ],
      { transaction: t }
    );

    const p2 = await Pesanan.create(
      {
        nomor_pesanan: 'BTC-0002',
        nama_pelanggan: 'Budi',
        jenis_pesanan: 'Makan di tempat',
        catatan: null,
        total_harga: 27000,
        status: 'Baru',
      },
      { transaction: t }
    );
    await ItemPesanan.bulkCreate(
      [
        {
          pesanan_id: p2.id,
          produk_id: null,
          nama_produk: 'Roti Bakar Strawberry',
          harga_satuan: 15000,
          jumlah: 1,
          subtotal: 15000,
        },
        {
          pesanan_id: p2.id,
          produk_id: null,
          nama_produk: 'Kopi Susu Chill',
          harga_satuan: 12000,
          jumlah: 1,
          subtotal: 12000,
        },
      ],
      { transaction: t }
    );
  });
};

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
  const qi = sequelize.getQueryInterface();
  const tabelProdukAda = await qi.tableExists('produk');
  const tabelPesananAda = await qi.tableExists('pesanan');

  await sequelize.sync();

  if (!tabelProdukAda) {
    await Produk.bulkCreate(seedProduk);
  }
  if (!tabelPesananAda) {
    await seedSampleOrders();
  }
};

module.exports = { sequelize, Produk, Pesanan, ItemPesanan, initDatabase };
