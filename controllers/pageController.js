const produkModel = require('../models/produkModel');

// GET / -> halaman utama (EJS), data produk diambil dari Model di backend
const home = (req, res) => {
  res.render('index', {
    title: 'Beranda',
    produk: produkModel.getAll(),
  });
};

module.exports = { home };
