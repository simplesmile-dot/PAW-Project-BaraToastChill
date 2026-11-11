const produkModel = require('../models/produkModel');
const { parseId, validateProduk } = require('../utils/validator');
const asyncHandler = require('../utils/asyncHandler');

const idTidakValid = (res) =>
  res.status(400).json({ pesan: 'ID produk harus berupa bilangan bulat positif' });

const tidakDitemukan = (res, id) =>
  res.status(404).json({ pesan: `Produk dengan ID ${id} tidak ditemukan` });

const dataTidakValid = (res, errors) =>
  res.status(400).json({ pesan: 'Data tidak valid', errors });

// GET /api/produk -> semua produk (array JSON)
const getAllProduk = asyncHandler(async (req, res) => {
  res.json(await produkModel.getAll());
});

// GET /api/produk/:id -> detail satu produk
const getProdukById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return idTidakValid(res);

  const produk = await produkModel.getById(id);
  if (!produk) return tidakDitemukan(res, id);

  res.json(produk);
});

// POST /api/produk -> tambah produk baru
const createProduk = asyncHandler(async (req, res) => {
  const { errors, data } = validateProduk(req.body);
  if (errors.length > 0) return dataTidakValid(res, errors);

  const baru = await produkModel.create(data);
  res.status(201).json(baru);
});

// PUT /api/produk/:id -> perbarui produk
const updateProduk = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return idTidakValid(res);

  const lama = await produkModel.getById(id);
  if (!lama) return tidakDitemukan(res, id);

  const { errors, data } = validateProduk(req.body, lama);
  if (errors.length > 0) return dataTidakValid(res, errors);

  res.json(await produkModel.update(id, data));
});

// DELETE /api/produk/:id -> hapus produk
const deleteProduk = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return idTidakValid(res);

  const lama = await produkModel.getById(id);
  if (!lama) return tidakDitemukan(res, id);

  await produkModel.remove(id);
  res.json({ pesan: 'Produk berhasil dihapus', data: lama });
});

module.exports = { getAllProduk, getProdukById, createProduk, updateProduk, deleteProduk };