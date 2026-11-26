const config = require('../config');
const produkModel = require('../models/produkModel');
const asyncHandler = require('../utils/asyncHandler');

// GET / -> halaman utama konsumen (chatbot pemesanan & daftar menu tersedia)
const home = asyncHandler(async (req, res) => {
  const produk = await produkModel.getAvailable();
  res.render('index', {
    title: 'Chatbot Pemesanan',
    produk,
    store: config.store,
  });
});

module.exports = { home };
