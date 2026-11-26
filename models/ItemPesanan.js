// Definisi model Sequelize untuk tabel "item_pesanan" di PostgreSQL.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ItemPesanan = sequelize.define(
  'ItemPesanan',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pesanan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    produk_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    harga_satuan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 20 },
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: 'item_pesanan',
    timestamps: false,
  }
);

module.exports = ItemPesanan;
