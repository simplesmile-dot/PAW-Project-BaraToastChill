// Penanganan route yang tidak ditemukan dan error server.
const notFound = (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ pesan: 'Endpoint tidak ditemukan' });
  }
  res.status(404).render('404', { title: 'Halaman tidak ditemukan' });
};

// eslint-disable-next-line no-unused-vars
const serverError = (err, req, res, next) => {
  console.error(err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ pesan: 'Terjadi kesalahan pada server' });
  }
  res.status(500).send('Terjadi kesalahan pada server');
};

module.exports = { notFound, serverError };
