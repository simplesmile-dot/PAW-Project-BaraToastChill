// Definisi model Sequelize untuk tabel "produk" di PostgreSQL.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Produk = sequelize.define(
  'Produk',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    kategori: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 1000000 },
    },
    tersedia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'produk',
    createdAt: 'dibuat_pada',
    updatedAt: 'diperbarui_pada',
  }
);

module.exports = Produk;