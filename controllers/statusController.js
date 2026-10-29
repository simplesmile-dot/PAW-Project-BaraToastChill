const config = require('../config');

// GET /api/status -> status aplikasi dalam format JSON
const getStatus = (req, res) => {
  res.json({
    status: 'ok',
    aplikasi: config.appName,
    versi: config.version,
    environment: config.env,
    uptime_detik: Math.round(process.uptime()),
    waktu: new Date().toISOString(),
  });
};

module.exports = { getStatus };
