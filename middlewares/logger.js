// Middleware logger: mencatat metode, path, status response, dan waktu request.
// Log dicetak setelah response selesai supaya status code sudah diketahui.
const logger = (req, res, next) => {
  const mulai = Date.now();

  res.on('finish', () => {
    const timestamp = new Date().toISOString();
    const durasi = Date.now() - mulai;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durasi}ms`);
  });

  next();
};

module.exports = logger;
