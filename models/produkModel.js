// Operasi data produk (CRUD) memakai Sequelize.
// Seluruh akses database ada di sini; controller cukup memanggil fungsi-fungsi ini.
const Produk = require('./Produk');

// Ambil hanya field yang dibutuhkan API (tanpa kolom timestamp)
const serialize = (row) =>
  row
    ? {
        id: row.id,
        nama: row.nama,
        kategori: row.kategori,
        harga: row.harga,
        tersedia: row.tersedia,
      }
    : null;

// READ: semua produk
const getAll = async () => {
  const rows = await Produk.findAll({ order: [['id', 'ASC']] });
  return rows.map(serialize);
};

// READ: hanya produk yang tersedia (untuk chatbot dan halaman konsumen)
const getAvailable = async () => {
  const rows = await Produk.findAll({
    where: { tersedia: true },
    order: [['id', 'ASC']],
  });
  return rows.map(serialize);
};

// READ: satu produk berdasarkan ID (null jika tidak ada)
const getById = async (id) => serialize(await Produk.findByPk(id));

// CREATE: tambah produk baru, mengembalikan produk yang tersimpan
const create = async ({ nama, kategori, harga, tersedia }) =>
  serialize(await Produk.create({ nama, kategori, harga, tersedia }));

// UPDATE: perbarui produk, mengembalikan data terbaru (null jika ID tidak ada)
const update = async (id, { nama, kategori, harga, tersedia }) => {
  const row = await Produk.findByPk(id);
  if (!row) return null;
  await row.update({ nama, kategori, harga, tersedia });
  return serialize(row);
};

// DELETE: hapus produk, true jika ada baris yang terhapus
const remove = async (id) => (await Produk.destroy({ where: { id } })) > 0;

// Jumlah produk (dipakai oleh /api/status)
const count = async () => Produk.count();

module.exports = { getAll, getAvailable, getById, create, update, remove, count };