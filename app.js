const express = require('express');
const path = require('path');

const config = require('./config');
const logger = require('./middlewares/logger');
const routes = require('./routes');
const { notFound, serverError } = require('./controllers/errorController');
const { formatRupiah } = require('./utils/format');

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

// 404 dan error handler (harus paling akhir)
app.use(notFound);
app.use(serverError);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`${config.appName} berjalan di http://localhost:${config.port}`);
  });
}

module.exports = app;
