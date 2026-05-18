// models/metodePembayaran.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MetodePembayaran = sequelize.define(
  "MetodePembayaran",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    kode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nama_metode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    urutan_tampil: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status_aktif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "metode_pembayaran",
    timestamps: true,
    underscored: true,
  }
);

module.exports = MetodePembayaran;