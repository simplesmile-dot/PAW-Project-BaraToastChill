const pesananModel = require('../models/pesananModel');
const { parseId, validatePesanan, validateStatusPesanan } = require('../utils/validator');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/pesanan -> konsumen membuat pesanan baru
const createPesanan = asyncHandler(async (req, res) => {
  const { errors, data } = validatePesanan(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      pesan: errors[0],
      errors,
    });
  }

  try {
    const baru = await pesananModel.createOrder(data);
    return res.status(201).json({
      pesan: 'Pesanan berhasil dibuat',
      data: baru,
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({
        pesan: err.message,
        errors: [err.message],
      });
    }
    throw err;
  }
});

// GET /api/pesanan/cek/:nomor -> konsumen mengecek status pesanan
const cekStatusPesanan = asyncHandler(async (req, res) => {
  const nomor = String(req.params.nomor || '').trim();
  if (!nomor) {
    return res.status(400).json({ pesan: 'Nomor pesanan wajib diisi' });
  }

  const order = await pesananModel.getByNomor(nomor);
  if (!order) {
    return res.status(404).json({ pesan: 'Pesanan tidak ditemukan' });
  }

  return res.json({ data: order });
});

// GET /api/pesanan -> admin melihat daftar pesanan dari yang terbaru
const getAllPesanan = asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const list = await pesananModel.getAllOrders({ status });
  res.json(list);
});

// PATCH /api/pesanan/:id/status -> admin/dapur mengubah status pesanan
const updateStatusPesanan = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ pesan: 'ID pesanan tidak valid' });
  }

  const { errors, status } = validateStatusPesanan(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ pesan: errors[0], errors });
  }

  const updated = await pesananModel.updateStatus(id, status);
  if (!updated) {
    return res.status(404).json({ pesan: 'Pesanan tidak ditemukan' });
  }

  res.json({
    pesan: `Status pesanan ${updated.nomor_pesanan} diubah menjadi ${updated.status}`,
    data: updated,
  });
});

module.exports = {
  createPesanan,
  cekStatusPesanan,
  getAllPesanan,
  updateStatusPesanan,
};
