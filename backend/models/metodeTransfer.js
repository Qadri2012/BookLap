// models/metodeTransfer.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MetodeTransfer = sequelize.define(
  "MetodeTransfer",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    metode_pembayaran_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    kode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nama_metode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    biaya_admin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    logo: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
    tableName: "metode_transfer",
    timestamps: true,
    underscored: true,
  }
);

module.exports = MetodeTransfer;