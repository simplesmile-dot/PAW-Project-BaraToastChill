// Koneksi PostgreSQL memakai Sequelize.
const { Sequelize } = require('sequelize');
const { Client } = require('pg');
const config = require('./index');

const { host, port, name, user, password, ssl, logging } = config.db;

const sequelize = new Sequelize(name, user, password, {
  host,
  port,
  dialect: 'postgres',
  logging: logging ? console.log : false,
  dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

// Membuat database (DB_NAME) secara otomatis bila belum ada, supaya tidak perlu
// membukanya manual di pgAdmin. Memakai database bawaan "postgres" untuk perintah CREATE DATABASE.
const ensureDatabase = async () => {
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error('DB_NAME hanya boleh berisi huruf, angka, dan underscore');
  }

  const admin = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
    ssl: ssl ? { rejectUnauthorized: false } : false,
  });

  await admin.connect();
  try {
    const hasil = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
    if (hasil.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${name}"`);
      console.log(`Database "${name}" belum ada, berhasil dibuat otomatis.`);
    }
  } finally {
    await admin.end();
  }
};

module.exports = { sequelize, ensureDatabase };