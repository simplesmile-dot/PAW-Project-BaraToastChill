const {
  parseId,
  validateProduk,
  validatePesanan,
  validateStatusPesanan,
} = require('../../../utils/validator');
const { validNewProduct, invalidProduct } = require('../../fixtures/products');
const { validOrderPayload } = require('../../fixtures/orders');
const { sampleCustomers } = require('../../fixtures/users');

describe('Unit Test: utils/validator.js', () => {
  describe('parseId()', () => {
    it('mengembalikan integer positif jika input valid', () => {
      expect(parseId('1')).toBe(1);
      expect(parseId(25)).toBe(25);
      expect(parseId(2147483647)).toBe(2147483647);
    });

    it('mengembalikan null untuk ID tidak valid (0, negatif, desimal, teks, overflow)', () => {
      expect(parseId(0)).toBeNull();
      expect(parseId(-5)).toBeNull();
      expect(parseId('1.5')).toBeNull();
      expect(parseId('abc')).toBeNull();
      expect(parseId(2147483648)).toBeNull();
    });
  });

  describe('validateProduk()', () => {
    it('menerima data produk valid dan membersihkan spasi', () => {
      const result = validateProduk({
        nama: '  Roti Bakar Keju  ',
        kategori: ' Roti Bakar ',
        harga: '18000',
        tersedia: true,
      });

      expect(result.errors).toEqual([]);
      expect(result.data).toEqual({
        nama: 'Roti Bakar Keju',
        kategori: 'Roti Bakar',
        harga: 18000,
        tersedia: true,
      });
    });

    it('mempertahankan nilai tersedia lama saat PUT bila tidak dikirim', () => {
      const result = validateProduk(
        { nama: validNewProduct.nama, kategori: validNewProduct.kategori, harga: 19000 },
        { tersedia: false }
      );

      expect(result.errors).toEqual([]);
      expect(result.data.tersedia).toBe(false);
    });

    it('menolak data produk yang tidak valid', () => {
      const result = validateProduk(invalidProduct);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
      expect(result.errors).toContain('nama wajib diisi');
      expect(result.errors).toContain('kategori wajib diisi');
      expect(result.errors).toContain('harga harus berupa bilangan bulat antara 0 dan 1000000');
      expect(result.errors).toContain('tersedia harus bernilai true atau false');
    });

    it('menolak nama dan kategori yang melebihi batas karakter serta harga di atas 1.000.000', () => {
      const result = validateProduk({
        nama: 'A'.repeat(101),
        kategori: 'B'.repeat(51),
        harga: 1000001,
      });
      expect(result.errors).toContain('nama maksimal 100 karakter');
      expect(result.errors).toContain('kategori maksimal 50 karakter');
      expect(result.errors).toContain('harga harus berupa bilangan bulat antara 0 dan 1000000');
    });
  });

  describe('validatePesanan()', () => {
    it('menerima payload pesanan yang valid', () => {
      const result = validatePesanan(validOrderPayload);
      expect(result.errors).toEqual([]);
      expect(result.data.nama_pelanggan).toBe('Rina');
      expect(result.data.jenis_pesanan).toBe('Bawa pulang');
      expect(result.data.items).toHaveLength(2);
    });

    it('menolak pesanan jika nama kosong atau terlalu panjang', () => {
      const resEmpty = validatePesanan({ ...validOrderPayload, nama_pelanggan: sampleCustomers.emptyName });
      expect(resEmpty.errors).toContain('Nama pemesan wajib diisi');

      const resLong = validatePesanan({ ...validOrderPayload, nama_pelanggan: sampleCustomers.tooLongName });
      expect(resLong.errors).toContain('Nama pemesan maksimal 100 karakter');
    });

    it('menolak jenis pesanan tidak valid, catatan kepanjangan, atau keranjang kosong', () => {
      const result = validatePesanan({
        nama_pelanggan: 'Rina',
        jenis_pesanan: 'Diantar Kurir',
        catatan: 'C'.repeat(256),
        items: [],
      });
      expect(result.errors).toContain('Jenis pesanan harus salah satu dari: Makan di tempat, Bawa pulang');
      expect(result.errors).toContain('Catatan maksimal 255 karakter');
      expect(result.errors).toContain('Keranjang pesanan tidak boleh kosong');
    });

    it('menolak item dengan produkId tidak valid atau jumlah di luar rentang 1–20', () => {
      const result = validatePesanan({
        nama_pelanggan: 'Rina',
        jenis_pesanan: 'Makan di tempat',
        items: [
          { produkId: 'abc', jumlah: 2 },
          { produkId: 1, jumlah: 21 },
          { produkId: 2, jumlah: 0 },
        ],
      });
      expect(result.errors).toContain('Item #1: produkId tidak valid');
      expect(result.errors).toContain('Item #2: jumlah harus bilangan bulat antara 1 dan 20');
      expect(result.errors).toContain('Item #3: jumlah harus bilangan bulat antara 1 dan 20');
    });
  });

  describe('validateStatusPesanan()', () => {
    it('menerima status Baru, Diproses, dan Siap', () => {
      expect(validateStatusPesanan({ status: 'Baru' }).errors).toEqual([]);
      expect(validateStatusPesanan({ status: 'Diproses' }).errors).toEqual([]);
      expect(validateStatusPesanan({ status: 'Siap' }).errors).toEqual([]);
    });

    it('menolak status yang tidak terdaftar', () => {
      const result = validateStatusPesanan({ status: 'Dibatalkan' });
      expect(result.errors).toEqual(['Status harus salah satu dari: Baru, Diproses, Siap']);
    });
  });
});
