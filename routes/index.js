const express = require('express');
const apiRoutes = require('./apiRoutes');
const pageRoutes = require('./pageRoutes');

const router = express.Router();

router.use('/api', apiRoutes); // /api/status, /api/produk
router.use('/', pageRoutes);   // halaman frontend

module.exports = router;
