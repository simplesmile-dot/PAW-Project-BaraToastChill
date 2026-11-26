// Definisi model Sequelize untuk tabel "pesanan" di PostgreSQL.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const STATUS_PESANAN = ['Baru', 'Diproses', 'Siap'];
const JENIS_PESANAN = ['Makan di tempat', 'Bawa pulang'];

const Pesanan = sequelize.define(
  'Pesanan',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomor_pesanan: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    nama_pelanggan: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    jenis_pesanan: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [JENIS_PESANAN],
      },
    },
    catatan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    total_harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Baru',
      validate: {
        isIn: [STATUS_PESANAN],
      },
    },
  },
  {
    tableName: 'pesanan',
    createdAt: 'dibuat_pada',
    updatedAt: 'diperbarui_pada',
  }
);

Pesanan.STATUS_PESANAN = STATUS_PESANAN;
Pesanan.JENIS_PESANAN = JENIS_PESANAN;

module.exports = Pesanan;
