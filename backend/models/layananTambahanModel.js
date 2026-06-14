// models/layananTambahanModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LayananTambahan = sequelize.define(
  "LayananTambahan",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_layanan: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    harga_satuan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status_aktif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "layanan_tambahan",
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = LayananTambahan;