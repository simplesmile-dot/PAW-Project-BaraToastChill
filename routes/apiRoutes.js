const express = require('express');
const statusController = require('../controllers/statusController');
const produkController = require('../controllers/produkController');

const router = express.Router();

router.get('/status', statusController.getStatus);

// CRUD produk
router.get('/produk', produkController.getAllProduk);
router.get('/produk/:id', produkController.getProdukById);
router.post('/produk', produkController.createProduk);
router.put('/produk/:id', produkController.updateProduk);
router.delete('/produk/:id', produkController.deleteProduk);

module.exports = router;