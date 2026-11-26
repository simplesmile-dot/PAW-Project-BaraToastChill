const express = require('express');
const pageController = require('../controllers/pageController');
const adminController = require('../controllers/adminController');
const { requireAdminPage } = require('../middlewares/adminAuth');

const router = express.Router();

// Halaman konsumen (chatbot & menu)
router.get('/', pageController.home);

// Autentikasi & halaman admin / dapur
router.get('/admin/login', adminController.loginPage);
router.post('/admin/login', adminController.loginSubmit);
router.post('/admin/logout', adminController.logout);
router.get('/admin', requireAdminPage, adminController.dashboard);

module.exports = router;
