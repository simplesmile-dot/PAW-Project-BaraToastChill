const express = require('express');
const path = require('path');

const config = require('./config');
const logger = require('./middlewares/logger');
const routes = require('./routes');
const { notFound, serverError } = require('./controllers/errorController');
const { initDatabase } = require('./models');
const { describeDbError } = require('./utils/dbError');
const { formatRupiah } = require('./utils/format');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// View engine: EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Variabel yang bisa dipakai di semua template EJS
app.locals.appName = config.appName;
app.locals.formatRupiah = formatRupiah;

// Middleware (logger dipasang paling awal agar semua request tercatat)
app.use(logger);
app.use(express.json());

// Routes
app.use(routes);
app.use('/api', chatRoutes);

// 404 dan error handler (harus paling akhir)
app.use(notFound);
app.use(serverError);

if (require.main === module) {
  // Server baru dinyalakan setelah koneksi database dan tabel siap
  initDatabase()
    .then(() => {
      console.log(`Database PostgreSQL terhubung: ${config.db.name} (${config.db.host}:${config.db.port})`);
      app.listen(config.port, () => {
        console.log(`${config.appName} berjalan di http://localhost:${config.port}`);
      });
    })
    .catch((err) => {
      console.error(`\n[GAGAL] ${describeDbError(err)}\n`);
      process.exit(1);
    });
}

module.exports = app;