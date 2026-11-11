const produkModel = require('../models/produkModel');
const asyncHandler = require('../utils/asyncHandler');

// GET / -> halaman utama (EJS), data produk diambil dari database lewat Model
const home = asyncHandler(async (req, res) => {
  res.render('index', {
    title: 'Beranda',
    produk: await produkModel.getAll(),
  });
});

module.exports = { home };