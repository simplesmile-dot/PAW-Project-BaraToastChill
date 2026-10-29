// Model produk: data contoh (array statis), belum memakai database.
// Field "tersedia" disiapkan untuk fitur F-08 (menu bisa dinonaktifkan).
const produk = [
  { id: 1, nama: 'Roti Bakar Coklat',      kategori: 'Roti Bakar', harga: 15000, tersedia: true },
  { id: 2, nama: 'Roti Bakar Coklat Keju', kategori: 'Roti Bakar', harga: 18000, tersedia: true },
  { id: 3, nama: 'Roti Bakar Strawberry',  kategori: 'Roti Bakar', harga: 15000, tersedia: true },
  { id: 4, nama: 'Roti Bakar Kacang Susu', kategori: 'Roti Bakar', harga: 17000, tersedia: true },
  { id: 5, nama: 'Roti Bakar Tiramisu',    kategori: 'Roti Bakar', harga: 20000, tersedia: false },
  { id: 6, nama: 'Es Teh Manis',           kategori: 'Minuman',    harga: 5000,  tersedia: true },
  { id: 7, nama: 'Kopi Susu Chill',        kategori: 'Minuman',    harga: 12000, tersedia: true },
];

// Mengembalikan salinan data agar array asli tidak berubah dari luar.
const getAll = () => produk.map((p) => ({ ...p }));

const getById = (id) => {
  const hasil = produk.find((p) => p.id === Number(id));
  return hasil ? { ...hasil } : null;
};

module.exports = { getAll, getById };
