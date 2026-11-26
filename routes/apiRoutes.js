const express = require('express');
const statusController = require('../controllers/statusController');
const produkController = require('../controllers/produkController');
const pesananController = require('../controllers/pesananController');
const { requireAdminApi } = require('../middlewares/adminAuth');

const router = express.Router();

// Status aplikasi
router.get('/status', statusController.getStatus);

// Produk publik (dibaca oleh konsumen/API)
router.get('/produk', produkController.getAllProduk);
router.get('/produk/:id', produkController.getProdukById);

// CRUD Produk (khusus admin yang sudah login)
router.post('/produk', requireAdminApi, produkController.createProduk);
router.put('/produk/:id', requireAdminApi, produkController.updateProduk);
router.patch('/produk/:id/status', requireAdminApi, produkController.toggleStatusProduk);
router.delete('/produk/:id', requireAdminApi, produkController.deleteProduk);

// Pesanan konsumen
router.post('/pesanan', pesananController.createPesanan);
router.get('/pesanan/cek/:nomor', pesananController.cekStatusPesanan);

// Manajemen pesanan (khusus admin / dapur yang sudah login)
router.get('/pesanan', requireAdminApi, pesananController.getAllPesanan);
router.patch('/pesanan/:id/status', requireAdminApi, pesananController.updateStatusPesanan);

module.exports = router;
