// models/detailLayananPemesanan.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DetailLayananPemesanan = sequelize.define(
  "DetailLayananPemesanan",
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

    layanan_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    harga_satuan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "detail_layanan_pemesanan",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = DetailLayananPemesanan;