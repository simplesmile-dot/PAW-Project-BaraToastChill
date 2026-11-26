// Validasi input produk, pesanan, dan ID, dipakai oleh controller.
const { STATUS_PESANAN, JENIS_PESANAN } = require('../models/Pesanan');

// Mengembalikan angka ID jika valid (bilangan bulat 1 sampai batas INTEGER PostgreSQL), selain itu null
const parseId = (value) => {
  const angka = Number(value);
  return Number.isInteger(angka) && angka > 0 && angka <= 2147483647 ? angka : null;
};

// Validasi body request untuk POST dan PUT produk.
// "existing" diisi saat PUT supaya field "tersedia" yang tidak dikirim tetap memakai nilai lama.
const validateProduk = (body, existing = null) => {
  const errors = [];
  const src = body && typeof body === 'object' ? body : {};

  const nama = typeof src.nama === 'string' ? src.nama.trim() : '';
  if (!nama) errors.push('nama wajib diisi');
  else if (nama.length > 100) errors.push('nama maksimal 100 karakter');

  const kategori = typeof src.kategori === 'string' ? src.kategori.trim() : '';
  if (!kategori) errors.push('kategori wajib diisi');
  else if (kategori.length > 50) errors.push('kategori maksimal 50 karakter');

  const hargaMentah =
    typeof src.harga === 'string' && src.harga.trim() !== '' ? Number(src.harga) : src.harga;
  if (!Number.isInteger(hargaMentah) || hargaMentah < 0 || hargaMentah > 1000000) {
    errors.push('harga harus berupa bilangan bulat antara 0 dan 1000000');
  }

  let tersedia = existing ? existing.tersedia : true;
  if (src.tersedia !== undefined) {
    if (typeof src.tersedia === 'boolean') tersedia = src.tersedia;
    else errors.push('tersedia harus bernilai true atau false');
  }

  return { errors, data: { nama, kategori, harga: hargaMentah, tersedia } };
};

// Validasi body request untuk pembuatan pesanan baru (POST /api/pesanan).
const validatePesanan = (body) => {
  const errors = [];
  const src = body && typeof body === 'object' ? body : {};

  const nama_pelanggan =
    typeof src.nama_pelanggan === 'string' ? src.nama_pelanggan.trim() : '';
  if (!nama_pelanggan) {
    errors.push('Nama pemesan wajib diisi');
  } else if (nama_pelanggan.length > 100) {
    errors.push('Nama pemesan maksimal 100 karakter');
  }

  const jenis_pesanan =
    typeof src.jenis_pesanan === 'string' ? src.jenis_pesanan.trim() : '';
  if (!JENIS_PESANAN.includes(jenis_pesanan)) {
    errors.push(`Jenis pesanan harus salah satu dari: ${JENIS_PESANAN.join(', ')}`);
  }

  const catatan = typeof src.catatan === 'string' ? src.catatan.trim() : '';
  if (catatan.length > 255) {
    errors.push('Catatan maksimal 255 karakter');
  }

  const rawItems = Array.isArray(src.items) ? src.items : [];
  if (rawItems.length === 0) {
    errors.push('Keranjang pesanan tidak boleh kosong');
  }

  const items = [];
  rawItems.forEach((item, index) => {
    const produkId = parseId(item && (item.produkId ?? item.produk_id ?? item.id));
    const jumlah = Number(item && item.jumlah);
    if (!produkId) {
      errors.push(`Item #${index + 1}: produkId tidak valid`);
    } else if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 20) {
      errors.push(`Item #${index + 1}: jumlah harus bilangan bulat antara 1 dan 20`);
    } else {
      items.push({ produkId, jumlah });
    }
  });

  return {
    errors,
    data: {
      nama_pelanggan,
      jenis_pesanan,
      catatan,
      items,
    },
  };
};

// Validasi perubahan status pesanan oleh admin/dapur.
const validateStatusPesanan = (body) => {
  const errors = [];
  const src = body && typeof body === 'object' ? body : {};
  const status = typeof src.status === 'string' ? src.status.trim() : '';

  if (!STATUS_PESANAN.includes(status)) {
    errors.push(`Status harus salah satu dari: ${STATUS_PESANAN.join(', ')}`);
  }

  return { errors, status };
};

module.exports = {
  parseId,
  validateProduk,
  validatePesanan,
  validateStatusPesanan,
};
