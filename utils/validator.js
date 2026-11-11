// Validasi input produk dan ID, dipakai oleh controller.

// Mengembalikan angka ID jika valid (bilangan bulat 1 sampai batas INTEGER PostgreSQL), selain itu null
const parseId = (value) => {
  const angka = Number(value);
  return Number.isInteger(angka) && angka > 0 && angka <= 2147483647 ? angka : null;
};

// Validasi body request untuk POST dan PUT.
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

module.exports = { parseId, validateProduk };