// Data contoh menu/produk untuk unit test dan integration test
const availableProducts = [
  {
    id: 1,
    nama: 'Roti Bakar Coklat',
    kategori: 'Roti Bakar',
    harga: 15000,
    tersedia: true,
  },
  {
    id: 2,
    nama: 'Roti Bakar Coklat Keju',
    kategori: 'Roti Bakar',
    harga: 18000,
    tersedia: true,
  },
  {
    id: 6,
    nama: 'Es Teh Manis',
    kategori: 'Minuman',
    harga: 5000,
    tersedia: true,
  },
];

const allProducts = [
  ...availableProducts,
  {
    id: 5,
    nama: 'Roti Bakar Tiramisu',
    kategori: 'Roti Bakar',
    harga: 20000,
    tersedia: false,
  },
];

const validNewProduct = {
  nama: 'Roti Bakar Matcha',
  kategori: 'Roti Bakar',
  harga: 19000,
  tersedia: true,
};

const invalidProduct = {
  nama: '',
  kategori: '',
  harga: -500,
  tersedia: 'ya',
};

module.exports = {
  availableProducts,
  allProducts,
  validNewProduct,
  invalidProduct,
};
