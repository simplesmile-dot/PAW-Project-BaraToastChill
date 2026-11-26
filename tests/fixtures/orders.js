// Data contoh pesanan untuk unit test dan integration test
const sampleOrderDiproses = {
  id: 1,
  nomor_pesanan: 'BTC-0001',
  nama_pelanggan: 'Rina',
  jenis_pesanan: 'Bawa pulang',
  catatan: 'Keju ekstra ya kak',
  total_harga: 41000,
  status: 'Diproses',
  dibuat_pada: '2026-11-26T10:00:00.000Z',
  diperbarui_pada: '2026-11-26T10:05:00.000Z',
  items: [
    {
      id: 1,
      produk_id: 2,
      nama_produk: 'Roti Bakar Coklat Keju',
      harga_satuan: 18000,
      jumlah: 2,
      subtotal: 36000,
    },
    {
      id: 2,
      produk_id: 6,
      nama_produk: 'Es Teh Manis',
      harga_satuan: 5000,
      jumlah: 1,
      subtotal: 5000,
    },
  ],
};

const sampleOrderBaru = {
  id: 2,
  nomor_pesanan: 'BTC-0002',
  nama_pelanggan: 'Budi',
  jenis_pesanan: 'Makan di tempat',
  catatan: '',
  total_harga: 30000,
  status: 'Baru',
  dibuat_pada: '2026-11-26T10:15:00.000Z',
  diperbarui_pada: '2026-11-26T10:15:00.000Z',
  items: [
    {
      id: 3,
      produk_id: 1,
      nama_produk: 'Roti Bakar Coklat',
      harga_satuan: 15000,
      jumlah: 2,
      subtotal: 30000,
    },
  ],
};

const validOrderPayload = {
  nama_pelanggan: 'Rina',
  jenis_pesanan: 'Bawa pulang',
  catatan: 'Tidak terlalu gosong',
  items: [
    { produkId: 2, jumlah: 2 },
    { produkId: 6, jumlah: 1 },
  ],
};

module.exports = {
  sampleOrderDiproses,
  sampleOrderBaru,
  validOrderPayload,
};
