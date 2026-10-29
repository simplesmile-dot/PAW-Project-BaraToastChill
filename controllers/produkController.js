const produkModel = require('../models/produkModel');

// GET /api/produk -> array produk dalam format JSON
const getAllProduk = (req, res) => {
  res.json(produkModel.getAll());
};

module.exports = { getAllProduk };
