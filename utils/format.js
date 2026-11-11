// Fungsi bantu yang dipakai ulang, mis. memformat angka menjadi Rupiah.
const formatRupiah = (angka) =>
  'Rp' + String(angka).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

module.exports = { formatRupiah };