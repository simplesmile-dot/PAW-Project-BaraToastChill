const express = require('express');
const statusController = require('../controllers/statusController');
const produkController = require('../controllers/produkController');

const router = express.Router();

router.get('/status', statusController.getStatus);
router.get('/produk', produkController.getAllProduk);

module.exports = router;
