const config = require('../config');
const { sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/status -> status aplikasi dalam format JSON
const getStatus = asyncHandler(async (req, res) => {
  let dbStatus = 'terhubung';
  try {
    await sequelize.authenticate();
  } catch (err) {
    dbStatus = 'terputus';
  }

  res.json({
    status: 'ok',
    aplikasi: config.appName,
    versi: config.version,
    environment: config.env,
    database: dbStatus,
    uptime_detik: Math.round(process.uptime()),
    waktu: new Date().toISOString(),
  });
});

module.exports = { getStatus };
