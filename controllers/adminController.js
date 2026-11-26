const config = require('../config');
const pesananModel = require('../models/pesananModel');
const produkModel = require('../models/produkModel');
const asyncHandler = require('../utils/asyncHandler');
const {
  getAdminSession,
  setAdminSession,
  clearAdminSession,
} = require('../middlewares/adminAuth');

// GET /admin/login -> halaman login admin sederhana
const loginPage = (req, res) => {
  if (getAdminSession(req)) {
    return res.redirect('/admin');
  }
  res.render('admin-login', {
    title: 'Login Admin',
    error: null,
    username: '',
  });
};

// POST /admin/login -> verifikasi login admin
const loginSubmit = (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const isMatch =
    username === config.admin.username && password === config.admin.password;

  if (!isMatch) {
    if (req.is('application/json') || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ pesan: 'Username atau password salah.' });
    }
    return res.status(401).render('admin-login', {
      title: 'Login Admin',
      error: 'Username atau password salah.',
      username,
    });
  }

  setAdminSession(res, username);
  if (req.is('application/json') || req.headers.accept?.includes('application/json')) {
    return res.json({ pesan: 'Login berhasil' });
  }
  return res.redirect('/admin');
};

// POST /admin/logout -> keluar dari sesi admin
const logout = (req, res) => {
  clearAdminSession(res);
  res.redirect('/admin/login');
};

// GET /admin -> dashboard pesanan masuk & kelola menu
const dashboard = asyncHandler(async (req, res) => {
  const [pesanan, produk] = await Promise.all([
    pesananModel.getAllOrders(),
    produkModel.getAll(),
  ]);

  res.render('admin', {
    title: 'Dashboard Admin & Dapur',
    adminUser: req.adminUser,
    pesanan,
    produk,
  });
});

module.exports = { loginPage, loginSubmit, logout, dashboard };
