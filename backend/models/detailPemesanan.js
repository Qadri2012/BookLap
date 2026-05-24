// models/detailPemesanan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DetailPemesanan = sequelize.define(
  "DetailPemesanan",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    pemesanan_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    nama_lapangan: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    nomor_lapangan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    jam_mulai: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    jam_selesai: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    durasi_jam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    harga: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "detail_pemesanan",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = DetailPemesanan;