// Operasi data pesanan memakai Sequelize.
// Seluruh perhitungan total dan validasi ketersediaan menu dilakukan di sisi server.
const crypto = require('crypto');
const { sequelize } = require('../config/database');
const Pesanan = require('./Pesanan');
const ItemPesanan = require('./ItemPesanan');
const Produk = require('./Produk');

const serializeItem = (item) => ({
  id: item.id,
  produk_id: item.produk_id,
  nama_produk: item.nama_produk,
  harga_satuan: item.harga_satuan,
  jumlah: item.jumlah,
  subtotal: item.subtotal,
});

const serializeOrder = (row) =>
  row
    ? {
        id: row.id,
        nomor_pesanan: row.nomor_pesanan,
        nama_pelanggan: row.nama_pelanggan,
        jenis_pesanan: row.jenis_pesanan,
        catatan: row.catatan || '',
        total_harga: row.total_harga,
        status: row.status,
        dibuat_pada: row.dibuat_pada,
        diperbarui_pada: row.diperbarui_pada,
        items: Array.isArray(row.items) ? row.items.map(serializeItem) : [],
      }
    : null;

const createAppError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const createOrder = async ({ nama_pelanggan, jenis_pesanan, catatan, items }) => {
  // Gabungkan item dengan produkId yang sama
  const merged = new Map();
  for (const item of items) {
    const prev = merged.get(item.produkId) || 0;
    const nextQty = prev + item.jumlah;
    if (nextQty < 1 || nextQty > 20) {
      throw createAppError('Jumlah per item harus antara 1 sampai 20.', 400);
    }
    merged.set(item.produkId, nextQty);
  }

  const produkIds = Array.from(merged.keys());

  return sequelize.transaction(async (t) => {
    const daftarProduk = await Produk.findAll({
      where: { id: produkIds },
      transaction: t,
    });

    const produkMap = new Map(daftarProduk.map((p) => [p.id, p]));
    const itemRows = [];
    let totalHarga = 0;

    for (const [produkId, jumlah] of merged.entries()) {
      const produk = produkMap.get(produkId);
      if (!produk) {
        throw createAppError(`Menu dengan ID ${produkId} tidak ditemukan.`, 400);
      }
      if (!produk.tersedia) {
        throw createAppError(`Menu "${produk.nama}" sedang habis / tidak tersedia.`, 400);
      }

      const subtotal = produk.harga * jumlah;
      totalHarga += subtotal;
      itemRows.push({
        produk_id: produk.id,
        nama_produk: produk.nama,
        harga_satuan: produk.harga,
        jumlah,
        subtotal,
      });
    }

    const tempNomor = `TMP-${crypto.randomBytes(10).toString('hex')}`;
    const pesanan = await Pesanan.create(
      {
        nomor_pesanan: tempNomor,
        nama_pelanggan,
        jenis_pesanan,
        catatan: catatan || null,
        total_harga: totalHarga,
        status: 'Baru',
      },
      { transaction: t }
    );

    const nomorResmi = `BTC-${String(pesanan.id).padStart(4, '0')}`;
    await pesanan.update({ nomor_pesanan: nomorResmi }, { transaction: t });

    await ItemPesanan.bulkCreate(
      itemRows.map((it) => ({ ...it, pesanan_id: pesanan.id })),
      { transaction: t }
    );

    const lengkap = await Pesanan.findByPk(pesanan.id, {
      include: [{ model: ItemPesanan, as: 'items' }],
      order: [[{ model: ItemPesanan, as: 'items' }, 'id', 'ASC']],
      transaction: t,
    });

    return serializeOrder(lengkap);
  });
};

const getAllOrders = async ({ status } = {}) => {
  const where = {};
  if (status && Pesanan.STATUS_PESANAN.includes(status)) {
    where.status = status;
  }

  const rows = await Pesanan.findAll({
    where,
    include: [{ model: ItemPesanan, as: 'items' }],
    order: [
      ['id', 'DESC'],
      [{ model: ItemPesanan, as: 'items' }, 'id', 'ASC'],
    ],
  });

  return rows.map(serializeOrder);
};

const getById = async (id) => {
  const row = await Pesanan.findByPk(id, {
    include: [{ model: ItemPesanan, as: 'items' }],
    order: [[{ model: ItemPesanan, as: 'items' }, 'id', 'ASC']],
  });
  return serializeOrder(row);
};

const getByNomor = async (nomorPesanan) => {
  const clean = String(nomorPesanan || '').trim().toUpperCase();
  if (!clean) return null;

  const row = await Pesanan.findOne({
    where: sequelize.where(sequelize.fn('UPPER', sequelize.col('nomor_pesanan')), clean),
    include: [{ model: ItemPesanan, as: 'items' }],
    order: [[{ model: ItemPesanan, as: 'items' }, 'id', 'ASC']],
  });
  return serializeOrder(row);
};

const updateStatus = async (id, status) => {
  const row = await Pesanan.findByPk(id);
  if (!row) return null;
  await row.update({ status });
  return getById(id);
};

module.exports = {
  createOrder,
  getAllOrders,
  getById,
  getByNomor,
  updateStatus,
  STATUS_PESANAN: Pesanan.STATUS_PESANAN,
  JENIS_PESANAN: Pesanan.JENIS_PESANAN,
};
